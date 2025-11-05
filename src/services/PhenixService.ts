import axios from "axios";

const BASE_URL = "/api/phenix";
let authToken: string | null = null;

export interface PhenixSim {
  msisdn: string;
  iccid: string;
  status: string; // Active, Suspended, Deleted
  type?: string; // Physical or eSIM
  imsi?: string;
}

export interface PhenixConsumption {
  msisdn: string;
  voice?: number; // en minutes
  sms?: number;
  mms?: number;
  data?: number; // en bytes
  month?: string;
  year?: string;
}

export interface PhenixRealtimeConsumption {
  msisdn: string;
  currentDataUsage: number; // en bytes
  zone?: string;
  timestamp?: string;
}

const ensureCredentials = () => {
  const username = import.meta.env.VITE_PHENIX_USERNAME;
  const password = import.meta.env.VITE_PHENIX_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Phenix credentials missing. Please define VITE_PHENIX_USERNAME and VITE_PHENIX_PASSWORD in your environment."
    );
  }

  return { username, password };
};

export const authenticatePhenix = async (): Promise<string> => {
  const { username, password } = ensureCredentials();

  try {
    console.log("Phenix: Tentative d'authentification...");
    console.log("Phenix: Username:", username);

    const response = await axios.post(
      `${BASE_URL}/Auth/authenticate`,
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Phenix: Réponse d'authentification reçue", response.data);

    // Le token peut être dans différents champs selon l'API
    // Priorité au working_token si présent (utilisé pour les appels API)
    authToken =
      response.data.working_token ||
      response.data.workingToken ||
      response.data.token ||
      response.data.access_token ||
      response.data.jwt;

    if (!authToken) {
      console.error("Phenix: Structure de réponse inattendue:", response.data);
      throw new Error("Token non trouvé dans la réponse");
    }

    console.log("Phenix: Authentification réussie, token reçu:", authToken.substring(0, 20) + "...");
    console.log("Phenix: Type de token utilisé:",
      response.data.working_token ? "working_token" :
      response.data.workingToken ? "workingToken" :
      response.data.token ? "token" :
      response.data.access_token ? "access_token" : "jwt"
    );
    return authToken;
  } catch (error: any) {
    console.error("Phenix authentication error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });

    const errorMsg = error.response?.data?.message ||
                     error.response?.data?.error ||
                     error.message ||
                     "Erreur d'authentification inconnue";

    throw new Error(`Échec authentification Phenix: ${errorMsg}`);
  }
};

const ensureAuthenticated = async (): Promise<string> => {
  if (!authToken) {
    await authenticatePhenix();
  }
  return authToken!;
};

export const listPhenixSims = async (): Promise<PhenixSim[]> => {
  const token = await ensureAuthenticated();

  try {
    console.log("Phenix: Récupération de la liste des SIMs...");
    console.log("Phenix: Token utilisé:", token.substring(0, 20) + "...");
    const response = await axios.get(`${BASE_URL}/GsmApi/V2/GetInfoSimList`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Phenix: Réponse GetInfoSimList:", response.data);

    // Adapter selon la structure réelle de la réponse
    const sims = response.data.sims || response.data.Sims || response.data || [];

    if (!Array.isArray(sims)) {
      console.error("Phenix: La réponse n'est pas un tableau:", sims);
      return [];
    }

    console.log(`Phenix: ${sims.length} SIM(s) trouvée(s)`);

    return sims.map((sim: any) => ({
      msisdn: sim.msisdn ?? sim.Msisdn ?? "",
      iccid: sim.iccid ?? sim.Iccid ?? "",
      status: sim.status ?? sim.state ?? sim.Status ?? sim.State ?? "Unknown",
      type: sim.type ?? sim.Type ?? undefined,
      imsi: sim.imsi ?? sim.Imsi ?? undefined,
    }));
  } catch (error: any) {
    console.error("Phenix list SIMs error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    throw error;
  }
};

export const getPhenixSimStatus = async (msisdn: string): Promise<PhenixSim | null> => {
  const token = await ensureAuthenticated();

  try {
    console.log(`Phenix: Consultation du statut de la ligne ${msisdn}...`);
    const response = await axios.get(`${BASE_URL}/GsmApi/V2/MsisdnConsult`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: { msisdn },
    });

    console.log("Phenix: Statut reçu:", response.data);
    const data = response.data;
    return {
      msisdn: data.msisdn ?? msisdn,
      iccid: data.iccid ?? "",
      status: data.status ?? data.state ?? data.Status ?? data.State ?? "Unknown",
      type: data.type ?? data.Type ?? undefined,
      imsi: data.imsi ?? data.Imsi ?? undefined,
    };
  } catch (error: any) {
    console.error("Phenix get SIM status error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return null;
  }
};

export const getPhenixRealtimeConsumption = async (
  msisdn: string
): Promise<PhenixRealtimeConsumption | null> => {
  const token = await ensureAuthenticated();

  try {
    const response = await axios.post(
      `${BASE_URL}/GsmApi/V2/SdtrConso`,
      { msisdn },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    return {
      msisdn,
      currentDataUsage: Number(data.currentDataUsage ?? data.dataUsage ?? 0),
      zone: data.zone ?? undefined,
      timestamp: data.timestamp ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error("Phenix realtime consumption error:", error);
    return null;
  }
};

export const getPhenixConsumptionHistory = async (
  msisdn: string,
  month: number,
  year: number
): Promise<PhenixConsumption | null> => {
  const token = await ensureAuthenticated();

  try {
    const response = await axios.get(`${BASE_URL}/GsmApi/GetConsoMsisdnFromCDR`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        msisdn,
        month,
        year,
      },
    });

    const data = response.data;
    return {
      msisdn,
      voice: Number(data.voice ?? 0),
      sms: Number(data.sms ?? 0),
      mms: Number(data.mms ?? 0),
      data: Number(data.data ?? 0),
      month: String(month),
      year: String(year),
    };
  } catch (error) {
    console.error("Phenix consumption history error:", error);
    return null;
  }
};

export const rechargePhenixSim = async (
  msisdn: string,
  volume: number
): Promise<boolean> => {
  const token = await ensureAuthenticated();

  try {
    const response = await axios.post(
      `${BASE_URL}/GsmApi/V2/MsisdnAddDataRecharge`,
      {
        msisdn,
        volume,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error("Phenix recharge error:", error);
    return false;
  }
};
