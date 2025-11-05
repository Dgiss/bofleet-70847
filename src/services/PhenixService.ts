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
  const partenaireId = import.meta.env.VITE_PHENIX_PARTENAIRE_ID;

  if (!username || !password) {
    throw new Error(
      "Phenix credentials missing. Please define VITE_PHENIX_USERNAME and VITE_PHENIX_PASSWORD in your environment."
    );
  }

  if (!partenaireId) {
    throw new Error(
      "Phenix partner ID missing. Please define VITE_PHENIX_PARTENAIRE_ID in your environment."
    );
  }

  return { username, password, partenaireId };
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

    // IMPORTANT : Selon la documentation Phenix, c'est l'access_token (Token JWT) qui doit être utilisé
    // Le working_token est juste un champ informatif
    authToken = response.data.access_token || response.data.token || response.data.jwt;

    if (!authToken) {
      console.error("Phenix: Structure de réponse inattendue:", response.data);
      throw new Error("Token d'accès (access_token) non trouvé dans la réponse");
    }

    console.log("Phenix: Authentification réussie");
    console.log("Phenix: Token reçu (JWT):", authToken.substring(0, 30) + "...");
    console.log("Phenix: Expires in:", response.data.expires_in, "secondes");
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
  const { partenaireId } = ensureCredentials();

  try {
    console.log("Phenix: Récupération de la liste des SIMs...");
    console.log("Phenix: PartenaireId:", partenaireId);
    const response = await axios.get(`${BASE_URL}/GsmApi/V2/GetInfoSimList`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        partenaireId,
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
  const { partenaireId } = ensureCredentials();

  try {
    console.log(`Phenix: Consultation du statut de la ligne ${msisdn}...`);
    const response = await axios.get(`${BASE_URL}/GsmApi/V2/MsisdnConsult`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        msisdn,
        partenaireId,
      },
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
  const { partenaireId } = ensureCredentials();

  try {
    const response = await axios.post(
      `${BASE_URL}/GsmApi/V2/SdtrConso`,
      {
        partenaireId,
        msisdn,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
  const { partenaireId } = ensureCredentials();

  try {
    const response = await axios.get(`${BASE_URL}/GsmApi/GetConsoMsisdnFromCDR`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        partenaireId,
        msisdn,
        moisAnnee: `${String(month).padStart(2, '0')}${year}`, // Format MMYYYY
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

/**
 * Recharge une carte SIM Phenix avec des données
 *
 * @param msisdn - Numéro MSISDN de la ligne
 * @param volumeMB - Volume de données à ajouter en MB
 * @param codeZone - Zone de recharge (par défaut : ZoneC = UE + DOM + Suisse + Andorre)
 *                   Zones disponibles : ZoneA, ZoneB, ZoneC, ZoneD, ZoneE, ZoneF, ZoneG, ZoneH,
 *                   FRANCE_BLOQUEE, FRANCE_FUP, HORS_EUROPE
 * @returns true si la recharge réussit, false sinon
 */
export const rechargePhenixSim = async (
  msisdn: string,
  volumeMB: number,
  codeZone: string = "ZoneC"
): Promise<boolean> => {
  const token = await ensureAuthenticated();
  const { partenaireId } = ensureCredentials();

  try {
    console.log(`Phenix: Recharge de ${volumeMB} MB pour ${msisdn} (Zone: ${codeZone})`);

    const response = await axios.post(
      `${BASE_URL}/GsmApi/V2/MsisdnAddDataRecharge`,
      {
        partenaireId,
        msisdn,
        volumeDataEnMo: volumeMB,
        codeZone,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Phenix: Recharge réussie", response.data);
    return response.status === 200;
  } catch (error: any) {
    console.error("Phenix recharge error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return false;
  }
};
