import axios from "axios";

const BASE_URL = "/api/truphone/api";
let authToken: string | null = null;

export interface TruphoneSim {
  simId: string;
  iccid: string;
  msisdn?: string;
  status: string; // active, inactive, suspended, etc.
  imsi?: string;
  label?: string; // Nom/label de la SIM
  description?: string; // Description
  imei?: string; // IMEI du device associé
  servicePack?: string; // Nom du service pack/rate plan
  simType?: string; // Type de SIM (FORM_FACTOR, etc.)
  organizationName?: string; // Nom de l'organisation
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

export interface TruphoneRatePlan {
  id: string;
  name: string;
  description?: string;
  dataAllowance?: number; // en MB
  validity?: number; // en jours
  price?: number;
  currency?: string;
  supportsTestMode?: boolean;
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

/**
 * Récupère une page de SIMs Truphone pour le lazy loading
 *
 * @param page - Numéro de la page (commence à 1)
 * @param perPage - Nombre de SIMs par page (défaut: 500, max: 500)
 * @returns Object avec sims, hasMore et totalLoaded
 */
export const listTruphoneSimsPaged = async (
  page: number = 1,
  perPage: number = 500
): Promise<{ sims: TruphoneSim[]; hasMore: boolean; page: number }> => {
  try {
    const headers = await getHeaders();
    console.log(`Truphone: Récupération page ${page}...`);

    const response = await axios.get(`${BASE_URL}/v2.2/sims`, {
      headers,
      params: {
        page,
        per_page: perPage,
      },
    });

    const sims = response.data.sims ?? response.data.results ?? response.data ?? [];

    if (!Array.isArray(sims)) {
      console.error("Truphone: La réponse n'est pas un tableau:", sims);
      return { sims: [], hasMore: false, page };
    }

    console.log(`Truphone: Page ${page} - ${sims.length} SIM(s) récupérée(s)`);

    const mappedSims = sims.map((sim: any) => {
      const rawStatus = extractSimStatus(sim);

      // Extraire le service pack depuis différents emplacements
      const servicePack = sim.subscription?.servicePackId ??
                          sim.subscription?.servicePack?.name ??
                          sim.servicePack ??
                          undefined;

      return {
        simId: sim.id ?? sim.simId ?? sim.sim_id ?? sim.iccid ?? "",
        iccid: sim.iccid ?? "",
        msisdn: sim.msisdn ?? sim.primaryMsisdn ?? undefined,
        status: normalizeTruphoneStatus(rawStatus),
        imsi: sim.imsi ?? sim.primaryImsi ?? undefined,
        label: sim.label ?? undefined,
        description: sim.description ?? undefined,
        imei: sim.imei ?? undefined,
        servicePack: servicePack,
        simType: sim.simType ?? undefined,
        organizationName: sim.organization?.name ?? sim.organizationName ?? undefined,
      };
    });

    // Il y a plus de pages si on a reçu exactement perPage SIMs
    const hasMore = sims.length === perPage;

    return {
      sims: mappedSims,
      hasMore,
      page,
    };
  } catch (error: any) {
    console.error("Truphone list SIMs paged error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Récupère TOUTES les SIMs Truphone (toutes les pages)
 * ATTENTION: Peut être lent si vous avez beaucoup de SIMs (1500+)
 * Pour le lazy loading, utilisez listTruphoneSimsPaged à la place
 */
export const listTruphoneSims = async (): Promise<TruphoneSim[]> => {
  try {
    const headers = await getHeaders();
    console.log("Truphone: Récupération de la liste des SIMs avec pagination...");

    let allSims: any[] = [];
    let page = 1;
    const perPage = 500; // Maximum par page
    let hasMore = true;

    // Pagination: récupérer toutes les pages
    while (hasMore) {
      console.log(`Truphone: Récupération page ${page}...`);

      const response = await axios.get(`${BASE_URL}/v2.2/sims`, {
        headers,
        params: {
          page,
          per_page: perPage,
        },
      });

      const sims = response.data.sims ?? response.data.results ?? response.data ?? [];

      if (!Array.isArray(sims)) {
        console.error("Truphone: La réponse n'est pas un tableau:", sims);
        break;
      }

      console.log(`Truphone: Page ${page} - ${sims.length} SIM(s) récupérée(s)`);
      allSims = allSims.concat(sims);

      // Vérifier s'il y a plus de pages
      // Si on reçoit moins que perPage, c'est la dernière page
      if (sims.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }

      // Sécurité: limiter à 20 pages max (10 000 SIMs)
      if (page > 20) {
        console.warn("⚠️ Truphone: Limite de 20 pages atteinte, arrêt de la pagination");
        hasMore = false;
      }
    }

    console.log(`✅ Truphone: ${allSims.length} SIM(s) au total récupérées`);

    return allSims.map((sim: any, index: number) => {
      // Extraire le statut en inspectant tous les champs possibles
      const rawStatus = extractSimStatus(sim);

      if (!rawStatus && index === 0) {
        console.warn(`⚠️ Truphone SIM #${index + 1} (${sim.iccid}): Aucun champ de statut trouvé`);
        // Logger un exemple de la première SIM pour debugging
        console.log("📋 Structure de la première SIM pour analyse:", {
          keys: Object.keys(sim),
          subscription: sim.subscription ? Object.keys(sim.subscription) : null,
          dates: sim.dates,
          attributes: sim.attributes,
        });
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
 * Récupère la liste des plans tarifaires (Rate Plans) disponibles
 *
 * Documentation: 1Global IoT Portal API
 * Endpoint: GET /api/rate_plan/
 *
 * NOTE: Utilise l'endpoint /rate_plan (singulier) qui liste tous les rate plans
 * disponibles pour votre compte Truphone.
 *
 * @returns Liste des plans tarifaires disponibles (ou vide si non accessible)
 */
export const getTruphoneRatePlans = async (): Promise<TruphoneRatePlan[]> => {
  try {
    const headers = await getHeaders();
    console.log("Truphone: Récupération des plans tarifaires via /api/rate_plan/...");

    // L'endpoint /rate_plan/ est à la racine /api/, pas sous /api/v2.x/
    // On doit utiliser /api/truphone/rate_plan/ au lieu de /api/truphone/api/rate_plan/
    const response = await axios.get("/api/truphone/rate_plan/", {
      headers,
      params: {
        per_page: 500, // Récupérer jusqu'à 500 plans
      },
    });

    console.log("Truphone: Réponse rate plans reçue", response.data);

    // La réponse peut être un tableau directement ou dans un objet
    let ratePlans = response.data;
    if (!Array.isArray(ratePlans)) {
      ratePlans = response.data.results ?? response.data.rate_plans ?? response.data.data ?? [];
    }

    if (!Array.isArray(ratePlans)) {
      console.error("Truphone: La réponse rate plans n'est pas un tableau:", response.data);
      return [];
    }

    console.log(`Truphone: ${ratePlans.length} plan(s) tarifaire(s) trouvé(s)`);

    return ratePlans.map((plan: any) => ({
      // Dans l'API Truphone, servicePackId est l'identifiant du rate plan
      id: plan.servicePackId ?? plan.service_pack_id ?? plan.id ?? "",
      name: plan.servicePackId ?? plan.service_pack_id ?? plan.name ?? "",
      description: plan.description ?? undefined,
      // Les détails de données peuvent être dans bearerServices
      dataAllowance: plan.data_allowance ?? plan.dataAllowance ??
                     plan.bearerServices?.data_allowance ??
                     plan.bearerServices?.dataAllowance ?? undefined,
      validity: plan.validity_days ?? plan.validityDays ?? plan.validity ?? undefined,
      price: plan.price ?? undefined,
      currency: plan.currency ?? "EUR",
      supportsTestMode: plan.supportsTestMode ?? false,
    }));
  } catch (error: any) {
    // Si l'endpoint n'est pas accessible ou redirige vers login (Network Error), retourner une liste vide
    if (error.response?.status === 403 || error.response?.status === 404 || error.message === 'Network Error') {
      console.warn(`⚠️ Truphone: L'endpoint /rate_plan n'est pas accessible${error.response?.status ? ` (${error.response.status})` : ' (Network Error - redirige vers login)'}`);
      console.warn("⚠️ Truphone: Cet endpoint semble être une interface web et non une API REST");
      console.warn("⚠️ Truphone: Utilisation de la détection automatique depuis les SIMs...");
      return [];
    }

    console.error("Truphone get rate plans error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    // Ne pas throw, retourner vide pour permettre la détection automatique
    return [];
  }
};

/**
 * Détecte automatiquement les rate plans utilisés par les SIMs existantes
 *
 * Cette fonction analyse toutes les SIMs pour extraire les informations de rate plan
 * depuis l'objet subscription. Utile quand l'API /rate_plans n'est pas accessible.
 *
 * @returns Liste des rate plans détectés (dédupliqués)
 */
export const detectRatePlansFromSims = async (): Promise<TruphoneRatePlan[]> => {
  try {
    const headers = await getHeaders();
    console.log("Truphone: Analyse des SIMs pour détecter les rate plans...");

    const response = await axios.get(`${BASE_URL}/v2.2/sims`, {
      headers,
    });

    const sims = response.data.sims ?? response.data.results ?? response.data ?? [];

    if (!Array.isArray(sims)) {
      console.error("Truphone: La réponse n'est pas un tableau:", sims);
      return [];
    }

    // Map pour dédupliquer les plans par ID
    const plansMap = new Map<string, TruphoneRatePlan>();

    sims.forEach((sim: any, index: number) => {
      // Afficher la structure complète des 3 premières SIMs pour debug
      if (index < 3) {
        console.log(`📋 SIM #${index + 1} - Structure complète:`, {
          iccid: sim.iccid,
          allSimKeys: Object.keys(sim),
          subscription: sim.subscription,
          subscriptionKeys: sim.subscription ? Object.keys(sim.subscription) : null,
        });
      }

      // Chercher les infos de rate plan dans l'objet subscription
      const subscription = sim.subscription;
      if (!subscription) {
        if (index === 0) console.log(`⚠️ SIM ${sim.iccid}: Pas d'objet subscription`);
        return;
      }

      const planId = subscription.service_pack_id ??
                     subscription.servicePackId ??
                     subscription.servicePack?.id ??
                     subscription.rate_plan_id ??
                     subscription.ratePlanId ??
                     subscription.ratePlan?.id ??
                     sim.service_pack_id ??
                     sim.servicePackId ??
                     sim.rate_plan_id ??
                     sim.ratePlanId;

      if (planId && !plansMap.has(planId)) {
        const plan: TruphoneRatePlan = {
          id: planId,
          name: subscription.service_pack_name ??
                subscription.servicePackName ??
                subscription.servicePack?.name ??
                subscription.rate_plan_name ??
                subscription.ratePlanName ??
                subscription.ratePlan?.name ??
                sim.service_pack_name ??
                sim.servicePackName ??
                `Plan ${planId}`,
          description: subscription.service_pack_description ??
                      subscription.servicePackDescription ??
                      subscription.servicePack?.description ??
                      sim.service_pack_description,
          dataAllowance: subscription.data_allowance ??
                        subscription.dataAllowance ??
                        subscription.servicePack?.data_allowance ??
                        subscription.servicePack?.dataAllowance ??
                        sim.data_allowance ??
                        sim.dataAllowance,
          validity: subscription.validity_days ??
                   subscription.validityDays ??
                   subscription.servicePack?.validity_days ??
                   subscription.servicePack?.validityDays ??
                   subscription.validity ??
                   sim.validity_days ??
                   sim.validityDays,
          price: subscription.price ?? subscription.servicePack?.price ?? sim.price,
          currency: subscription.currency ?? subscription.servicePack?.currency ?? sim.currency ?? "EUR",
        };

        plansMap.set(planId, plan);
        console.log(`✅ Rate plan détecté: ${plan.name} (${plan.id})`, plan);
      } else if (index < 3) {
        console.log(`⚠️ SIM #${index + 1}: Pas de service pack ID trouvé`);
      }
    });

    const detectedPlans = Array.from(plansMap.values());
    console.log(`🎯 Truphone: ${detectedPlans.length} rate plan(s) unique(s) détecté(s)`);

    if (detectedPlans.length > 0) {
      console.log("📝 Ajoutez ces plans dans RATE_PLAN_CONFIG:");
      console.log(JSON.stringify(detectedPlans, null, 2));
    }

    return detectedPlans;
  } catch (error: any) {
    console.error("Truphone detect rate plans error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return [];
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
 * Configuration des plans tarifaires pour la recharge
 *
 * Si l'API /rate_plans n'est pas accessible, vous pouvez configurer manuellement
 * vos rate plans ici. Trouvez les IDs de vos plans dans le portail Truphone:
 * https://iot.truphone.com/
 *
 * Exemple de configuration:
 * const RATE_PLAN_CONFIG: TruphoneRatePlan[] = [
 *   { id: "plan_id_100mb", name: "100MB Plan", dataAllowance: 100 },
 *   { id: "plan_id_500mb", name: "500MB Plan", dataAllowance: 500 },
 *   { id: "plan_id_1gb", name: "1GB Plan", dataAllowance: 1000 },
 * ];
 */
const RATE_PLAN_CONFIG: TruphoneRatePlan[] = [
  // TODO: Configurez vos plans tarifaires ici si l'API n'est pas accessible
  // Exemple:
  // { id: "votre_plan_id", name: "100MB", dataAllowance: 100 },
];

/**
 * "Recharge" une carte SIM Truphone/1GLOBAL
 *
 * NOTE: Truphone/1GLOBAL ne propose pas d'endpoint direct de recharge de données.
 * Cette fonction simule une recharge en changeant le plan tarifaire.
 *
 * Stratégie de sélection du plan:
 * 1. Tente de récupérer les plans tarifaires via l'API /rate_plans
 * 2. Si l'API n'est pas accessible, utilise la configuration manuelle RATE_PLAN_CONFIG
 * 3. Si RATE_PLAN_CONFIG est vide, tente de détecter les plans depuis les SIMs existantes
 * 4. Filtre les plans qui ont un dataAllowance >= volumeMB
 * 5. Sélectionne le plan avec le dataAllowance le plus proche (optimal)
 * 6. Applique le changement de plan
 *
 * Configuration manuelle:
 * Si l'API /rate_plans n'est pas accessible (403), configurez manuellement vos plans
 * dans la constante RATE_PLAN_CONFIG ci-dessus.
 *
 * Alternative : Configurez un "Auto Top-Up" dans le portail Truphone.
 * Documentation : https://docs.things.1global.com/docs/get-started/configure-auto-topup/
 *
 * @param iccid - ICCID de la carte SIM
 * @param volumeMB - Volume de données souhaité en MB
 * @param nextBillingCycle - Si true, applique au prochain cycle. Si false (défaut), applique immédiatement.
 * @returns true si la recharge réussit
 * @throws Error si aucun plan correspondant n'est trouvé ou si la recharge échoue
 */
export const rechargeTruphoneSim = async (
  iccid: string,
  volumeMB: number,
  nextBillingCycle: boolean = false
): Promise<boolean> => {
  try {
    console.log(`Truphone: Recharge demandée pour ${iccid} - ${volumeMB} MB`);

    // 1. Tenter de récupérer les plans tarifaires via l'API
    let ratePlans = await getTruphoneRatePlans();

    // 2. Si l'API ne retourne rien, utiliser la configuration manuelle
    if (ratePlans.length === 0 && RATE_PLAN_CONFIG.length > 0) {
      console.log("Truphone: Utilisation de la configuration manuelle RATE_PLAN_CONFIG");
      ratePlans = RATE_PLAN_CONFIG;
    }

    // 3. Si toujours vide, essayer de détecter automatiquement depuis les SIMs
    if (ratePlans.length === 0) {
      console.log("Truphone: Tentative de détection automatique des rate plans depuis les SIMs...");
      ratePlans = await detectRatePlansFromSims();
    }

    if (ratePlans.length === 0) {
      throw new Error(
        "Aucun plan tarifaire disponible.\n\n" +
        "L'API /rate_plans n'est pas accessible (403 Forbidden), aucun plan n'est configuré manuellement, " +
        "et la détection automatique n'a trouvé aucun plan dans vos SIMs.\n\n" +
        "Pour configurer manuellement vos plans:\n" +
        "1. Trouvez les IDs de vos plans dans le portail Truphone: https://iot.truphone.com/\n" +
        "2. Ajoutez-les dans la constante RATE_PLAN_CONFIG dans src/services/TruphoneService.ts\n\n" +
        "Ou utilisez la fonction Auto Top-Up du portail: https://docs.things.1global.com/docs/get-started/configure-auto-topup/"
      );
    }

    console.log(`Truphone: ${ratePlans.length} plan(s) disponible(s) pour la sélection`);

    // 3. Filtrer les plans qui ont suffisamment de données
    const suitablePlans = ratePlans.filter((plan) => {
      const allowance = plan.dataAllowance ?? 0;
      return allowance >= volumeMB;
    });

    if (suitablePlans.length === 0) {
      // Si aucun plan n'a assez de données, prendre le plus grand disponible
      console.warn(
        `⚠️ Truphone: Aucun plan avec ${volumeMB} MB trouvé, sélection du plan le plus grand`
      );
      const largestPlan = ratePlans.reduce((max, plan) => {
        const maxAllowance = max.dataAllowance ?? 0;
        const planAllowance = plan.dataAllowance ?? 0;
        return planAllowance > maxAllowance ? plan : max;
      });

      if (!largestPlan.id) {
        throw new Error("Impossible de trouver un plan tarifaire valide");
      }

      console.log(
        `Truphone: Plan sélectionné: ${largestPlan.name} (${largestPlan.dataAllowance} MB)`
      );

      return await changeTruphoneRatePlan(iccid, largestPlan.id, nextBillingCycle);
    }

    // 4. Sélectionner le plan avec le dataAllowance le plus proche (optimal)
    const optimalPlan = suitablePlans.reduce((best, plan) => {
      const bestAllowance = best.dataAllowance ?? Infinity;
      const planAllowance = plan.dataAllowance ?? Infinity;
      return planAllowance < bestAllowance ? plan : best;
    });

    console.log(
      `Truphone: Plan optimal sélectionné: ${optimalPlan.name} (${optimalPlan.dataAllowance} MB) pour une demande de ${volumeMB} MB`
    );

    // 5. Appliquer le changement de plan
    return await changeTruphoneRatePlan(iccid, optimalPlan.id, nextBillingCycle);
  } catch (error: any) {
    console.error("❌ Truphone recharge error:", {
      message: error.message,
      iccid,
      volumeMB,
    });

    throw new Error(
      `Échec de la recharge Truphone pour ${iccid}: ${error.message}`
    );
  }
};
