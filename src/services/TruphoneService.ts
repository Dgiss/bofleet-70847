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

export const getTruphoneSimStatus = async (iccid: string): Promise<TruphoneSim | null> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${BASE_URL}/v2.2/sims/${iccid}`, {
      headers,
    });

    const data = response.data;
    return {
      simId: data.id ?? data.simId ?? data.sim_id ?? iccid,
      iccid: data.iccid ?? iccid,
      msisdn: data.msisdn ?? undefined,
      status: data.status ?? data.state ?? "Unknown",
      imsi: data.imsi ?? undefined,
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
    return sims.map((sim: any) => ({
      simId: sim.id ?? sim.simId ?? sim.sim_id ?? sim.iccid ?? "",
      iccid: sim.iccid ?? "",
      msisdn: sim.msisdn ?? undefined,
      status: sim.status ?? sim.state ?? "Unknown",
      imsi: sim.imsi ?? undefined,
    }));
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
 * NOTE: Truphone/1GLOBAL ne propose pas d'endpoint direct de "recharge" de données.
 * Les "top-ups" se font généralement en changeant le plan tarifaire (rate plan/subscription).
 * Consultez la documentation API complète : https://iot.truphone.com/api/doc/#!/api
 *
 * @param iccid - ICCID de la carte SIM
 * @param ratePlanId - ID du nouveau plan tarifaire
 * @param immediate - Si true, applique immédiatement. Si false, applique au prochain cycle de facturation
 * @returns true si le changement réussit, false sinon
 */
export const changeTruphoneRatePlan = async (
  iccid: string,
  ratePlanId: string,
  immediate: boolean = false
): Promise<boolean> => {
  try {
    const headers = await getHeaders();
    console.log(`Truphone: Changement de plan tarifaire pour ${iccid} -> ${ratePlanId}`);

    const response = await axios.put(
      `${BASE_URL}/v2.2/sims/${iccid}/subscription`,
      {
        rate_plan_id: ratePlanId,
        apply_immediately: immediate,
      },
      { headers }
    );

    console.log("Truphone: Plan tarifaire changé avec succès", response.data);
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error("Truphone change rate plan error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      `Échec du changement de plan tarifaire Truphone: ${error.response?.data?.message || error.message}`
    );
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
