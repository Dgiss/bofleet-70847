import axios from "axios";

const BASE_URL = "/api/truphone/api";
let authToken: string | null = null;

export interface TruphoneSim {
  simId: string;
  iccid: string;
  msisdn?: string;
  status: string; // active, inactive, suspended, etc.
  imsi?: string;
}

export interface TruphoneUsage {
  simId: string;
  dataUsage: number; // en bytes
  smsCount?: number;
  callDuration?: number; // en minutes
  startDate?: string;
  endDate?: string;
}

export interface TruphoneBalance {
  accountId: string;
  balance: number;
  currency: string;
  planDetails?: any;
}

const ensureCredentials = () => {
  const apiKey = import.meta.env.VITE_TRUPHONE_API_KEY;
  const username = import.meta.env.VITE_TRUPHONE_USERNAME;
  const password = import.meta.env.VITE_TRUPHONE_PASSWORD;

  if (apiKey) {
    return { apiKey, username: null, password: null };
  }

  if (!username || !password) {
    throw new Error(
      "Truphone credentials missing. Please define either VITE_TRUPHONE_API_KEY or VITE_TRUPHONE_USERNAME and VITE_TRUPHONE_PASSWORD in your environment."
    );
  }

  return { apiKey: null, username, password };
};

export const authenticateTruphone = async (): Promise<string> => {
  const { apiKey, username, password } = ensureCredentials();

  // Si on a déjà une API key, l'utiliser directement
  if (apiKey) {
    console.log("Truphone: Utilisation de l'API Key");
    authToken = apiKey;
    return apiKey;
  }

  // Sinon, s'authentifier avec username/password
  try {
    console.log("Truphone: Tentative d'authentification avec username/password...");
    const response = await axios.post(`${BASE_URL}/auth`, {
      username,
      password,
    });

    console.log("Truphone: Réponse d'authentification reçue", response.data);
    authToken = response.data.token ?? response.data.api_key;

    if (!authToken) {
      throw new Error("Token non reçu dans la réponse");
    }

    console.log("Truphone: Authentification réussie");
    return authToken;
  } catch (error: any) {
    console.error("Truphone authentication error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(`Échec authentification Truphone: ${error.response?.data?.message || error.message}`);
  }
};

const ensureAuthenticated = async (): Promise<string> => {
  if (!authToken) {
    await authenticateTruphone();
  }
  return authToken!;
};

const getHeaders = async () => {
  const token = await ensureAuthenticated();
  return {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * Extrait le statut d'une SIM en inspectant tous les champs possibles
 * y compris les objets imbriqués
 */
const extractSimStatus = (sim: any): string | undefined => {
  // Essayer les champs directs
  let status = sim.status ??
               sim.state ??
               sim.sim_status ??
               sim.simStatus ??
               sim.subscription_status ??
               sim.subscriptionStatus ??
               sim.connectivity_status ??
               sim.connectivityStatus;

  if (status) return status;

  // Essayer dans l'objet subscription
  if (sim.subscription) {
    status = sim.subscription.status ??
             sim.subscription.state ??
             sim.subscription.subscription_status ??
             sim.subscription.subscriptionStatus ??
             sim.subscription.connectivity_status ??
             sim.subscription.connectivityStatus;

    if (status) return status;
  }

  // Essayer dans l'objet dates (peut contenir des infos d'activation/désactivation)
  if (sim.dates) {
    // Si la SIM a une date d'activation mais pas de date de désactivation, elle est probablement active
    if (sim.dates.activated && !sim.dates.deactivated && !sim.dates.suspended) {
      return "ACTIVATED";
    }
    if (sim.dates.deactivated) {
      return "DEACTIVATED";
    }
    if (sim.dates.suspended) {
      return "SUSPENDED";
    }
  }

  // Essayer dans l'objet attributes
  if (sim.attributes && typeof sim.attributes === 'object') {
    status = sim.attributes.status ?? sim.attributes.state;
    if (status) return status;
  }

  return undefined;
};

/**
 * Normalise le statut Truphone/1Global vers un format standard
 *
 * Statuts possibles de l'API 1Global:
 * - ACTIVATED: Carte SIM active
 * - DEACTIVATED: Carte SIM désactivée
 * - SUSPENDED: Carte SIM suspendue
 * - TEST_READY: Prête pour les tests
 * - INVENTORY: En inventaire
 * - RETIRED: Retirée
 */
const normalizeTruphoneStatus = (apiStatus: string | undefined): string => {
  if (!apiStatus) {
    console.warn("⚠️ Truphone: Statut manquant dans la réponse API");
    return "UNKNOWN";
  }

  // Normaliser en majuscules pour la comparaison
  const status = String(apiStatus).toUpperCase();

  // Mapper les statuts Truphone vers des noms standard
  const statusMap: Record<string, string> = {
    "ACTIVATED": "ACTIVE",
    "ACTIVE": "ACTIVE",
    "DEACTIVATED": "INACTIVE",
    "INACTIVE": "INACTIVE",
    "NOT ACTIVE": "INACTIVE",
    "SUSPENDED": "SUSPENDED",
    "TEST_READY": "TEST_READY",
    "INVENTORY": "INVENTORY",
    "RETIRED": "RETIRED",
  };

  const normalizedStatus = statusMap[status] || status;
  console.log(`Truphone: Statut normalisé: "${apiStatus}" → "${normalizedStatus}"`);

  return normalizedStatus;
};

export const getTruphoneSimStatus = async (iccid: string): Promise<TruphoneSim | null> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${BASE_URL}/v2.2/sims/${iccid}`, {
      headers,
    });

    const data = response.data;

    // Utiliser la même fonction d'extraction que pour la liste
    const rawStatus = extractSimStatus(data);

    if (!rawStatus) {
      console.warn(`⚠️ Truphone SIM ${iccid}: Aucun champ de statut trouvé`);
      console.log("📋 Structure de la SIM pour analyse:", {
        keys: Object.keys(data),
        subscription: data.subscription ? Object.keys(data.subscription) : null,
        dates: data.dates,
        attributes: data.attributes,
      });
    }

    return {
      simId: data.id ?? data.simId ?? data.sim_id ?? iccid,
      iccid: data.iccid ?? iccid,
      msisdn: data.msisdn ?? data.primaryMsisdn ?? undefined,
      status: normalizeTruphoneStatus(rawStatus),
      imsi: data.imsi ?? data.primaryImsi ?? undefined,
    };
  } catch (error) {
    console.error("Truphone get SIM status error:", error);
    return null;
  }
};

export const getTruphoneUsage = async (
  iccid: string,
  startDate?: string,
  endDate?: string
): Promise<TruphoneUsage | null> => {
  try {
    const headers = await getHeaders();
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get(`${BASE_URL}/v2.2/sims/${iccid}/data_usage`, {
      headers,
      params,
    });

    const data = response.data;
    return {
      simId: iccid,
      dataUsage: Number(data.dataUsage ?? data.data_usage ?? data.data ?? 0),
      smsCount: data.smsCount ?? data.sms_count ?? data.sms ?? undefined,
      callDuration: data.callDuration ?? data.call_duration ?? data.voice ?? undefined,
      startDate: data.startDate ?? startDate,
      endDate: data.endDate ?? endDate,
    };
  } catch (error) {
    console.error("Truphone get usage error:", error);
    return null;
  }
};

export const getTruphoneBalance = async (
  accountId: string
): Promise<TruphoneBalance | null> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${BASE_URL}/accounts/${accountId}/balance`, {
      headers,
    });

    const data = response.data;
    return {
      accountId,
      balance: Number(data.balance ?? 0),
      currency: data.currency ?? "EUR",
      planDetails: data.planDetails ?? data.plan_details ?? undefined,
    };
  } catch (error) {
    console.error("Truphone get balance error:", error);
    return null;
  }
};

export const listTruphoneSims = async (): Promise<TruphoneSim[]> => {
  try {
    const headers = await getHeaders();
    console.log("Truphone: Récupération de la liste des SIMs...");
    const response = await axios.get(`${BASE_URL}/v2.2/sims`, {
      headers,
    });

    console.log("Truphone: Réponse reçue", response.data);
    const sims = response.data.sims ?? response.data.results ?? response.data ?? [];

    if (!Array.isArray(sims)) {
      console.error("Truphone: La réponse n'est pas un tableau:", sims);
      return [];
    }

    console.log(`Truphone: ${sims.length} SIM(s) trouvée(s)`);

    return sims.map((sim: any, index: number) => {
      // Extraire le statut en inspectant tous les champs possibles
      const rawStatus = extractSimStatus(sim);

      if (!rawStatus) {
        console.warn(`⚠️ Truphone SIM #${index + 1} (${sim.iccid}): Aucun champ de statut trouvé`);
        // Logger un exemple de la première SIM pour debugging
        if (index === 0) {
          console.log("📋 Structure de la première SIM pour analyse:", {
            keys: Object.keys(sim),
            subscription: sim.subscription ? Object.keys(sim.subscription) : null,
            dates: sim.dates,
            attributes: sim.attributes,
          });
        }
      }

      return {
        simId: sim.id ?? sim.simId ?? sim.sim_id ?? sim.iccid ?? "",
        iccid: sim.iccid ?? "",
        msisdn: sim.msisdn ?? sim.primaryMsisdn ?? undefined,
        status: normalizeTruphoneStatus(rawStatus),
        imsi: sim.imsi ?? sim.primaryImsi ?? undefined,
      };
    });
  } catch (error: any) {
    console.error("Truphone list SIMs error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    throw error;
  }
};

/**
 * Change le plan tarifaire d'une carte SIM Truphone/1GLOBAL
 *
 * Documentation: 1Global IoT Portal API v2.2
 * Endpoint: PATCH /api/v2.2/sims/{iccid}/subscription
 *
 * NOTE: Truphone/1GLOBAL ne propose pas d'endpoint direct de "recharge" de données.
 * Les "top-ups" se font en changeant le forfait d'abonnement (Rate Plan / Service Pack).
 *
 * Réponses HTTP:
 * - 200: Changement de plan tarifaire planifié annulé (si vous renvoyez le plan actuel)
 * - 204: Changement de plan tarifaire créé avec succès
 * - 400: Requête incorrecte (champs obligatoires manquants ou valeurs invalides)
 * - 404: Carte SIM introuvable
 *
 * @param iccid - ICCID de la carte SIM
 * @param servicePackId - ID du forfait de service (Rate Plan)
 * @param nextBillingCycle - Si true, applique au prochain cycle. Si false, applique immédiatement.
 * @returns true si le changement réussit
 * @throws Error en cas d'échec
 */
export const changeTruphoneRatePlan = async (
  iccid: string,
  servicePackId: string,
  nextBillingCycle: boolean = false
): Promise<boolean> => {
  try {
    const headers = await getHeaders();
    console.log(`Truphone: Changement de plan tarifaire pour ${iccid}`);
    console.log(`  - Service Pack ID: ${servicePackId}`);
    console.log(`  - Application: ${nextBillingCycle ? "Prochain cycle" : "Immédiat"}`);

    const response = await axios.patch(
      `${BASE_URL}/v2.2/sims/${iccid}/subscription`,
      {
        service_pack_id: servicePackId,
        next_billing_cycle: nextBillingCycle,
      },
      { headers }
    );

    if (response.status === 200) {
      console.log("✅ Truphone: Changement de plan planifié annulé");
    } else if (response.status === 204) {
      console.log("✅ Truphone: Changement de plan créé avec succès");
    }

    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error("❌ Truphone change rate plan error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    let errorMessage = "Échec du changement de plan tarifaire Truphone";
    if (error.response?.data?.detail) {
      errorMessage += `: ${error.response.data.detail}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
};

/**
 * "Recharge" une carte SIM Truphone/1GLOBAL
 *
 * NOTE: Truphone/1GLOBAL ne propose pas d'endpoint direct de recharge de données.
 * Cette fonction est un wrapper qui simule une recharge en changeant le plan tarifaire.
 * Pour une vraie recharge, vous devez :
 * 1. Créer des plans tarifaires prédéfinis dans votre compte Truphone
 * 2. Mapper les volumes de recharge aux IDs de plans
 * 3. Utiliser changeTruphoneRatePlan() avec le bon plan
 *
 * Alternative : Configurez un "Auto Top-Up" dans le portail Truphone.
 * Documentation : https://docs.things.1global.com/docs/get-started/configure-auto-topup/
 *
 * @param iccid - ICCID de la carte SIM
 * @param volumeMB - Volume de données souhaité (utilisé pour déterminer le plan)
 * @returns true si la recharge réussit, false sinon
 * @throws Error car non implémenté sans mapping de plans
 */
export const rechargeTruphoneSim = async (
  iccid: string,
  volumeMB: number
): Promise<boolean> => {
  console.warn("⚠️ Truphone: Fonction de recharge non implémentée (pas d'endpoint direct de recharge)");
  console.log(`Truphone: Recharge demandée pour ${iccid} - ${volumeMB} MB`);

  // TODO: Implémenter le mapping volume -> rate plan ID
  // Exemple d'implémentation possible:
  /*
  const ratePlanMap: Record<number, string> = {
    100: "plan_id_100mb",
    500: "plan_id_500mb",
    1000: "plan_id_1gb",
    5000: "plan_id_5gb",
  };

  const ratePlanId = ratePlanMap[volumeMB];
  if (!ratePlanId) {
    throw new Error(`Aucun plan tarifaire configuré pour ${volumeMB} MB`);
  }

  return await changeTruphoneRatePlan(iccid, ratePlanId, true);
  */

  throw new Error(
    "La recharge Truphone nécessite un mapping de plans tarifaires. " +
    "Configurez les plans dans votre compte Truphone puis implémentez le mapping dans rechargeTruphoneSim(). " +
    "Ou utilisez la fonction Auto Top-Up du portail : https://docs.things.1global.com/docs/get-started/configure-auto-topup/"
  );
};
