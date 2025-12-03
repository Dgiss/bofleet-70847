import axios from "axios";

const BASE_URL = "/api/phenix";
let authToken: string | null = null;
let cachedPartnerId: string | null = null;

export interface PhenixSim {
  // Identifiants
  iccid: string;           // simSN de l'API
  imsi: string;
  msisdn: string;          // Numéro de téléphone
  
  // Statut
  status: string;          // etat (code numérique)
  statusLabel: string;     // etatLibelle ("Active", "Suspendue", etc.)
  
  // Infos réseau
  operator: string;        // operateur
  simType: string;         // typeSim
  
  // Codes de sécurité
  puk1: string;
  pin1: string;
  puk2: string;
  pin2: string;
  
  // Client
  clientCode: string;      // codeClient
  orderId: string;         // commandeSimId
  
  // Données brutes (pour debug)
  rawData?: any;
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

/**
 * Décode un JWT et extrait le payload
 */
const decodeJwtPayload = (token: string): any => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (error) {
    console.error("Erreur lors du décodage du JWT:", error);
    return null;
  }
};

export const authenticatePhenix = async (): Promise<{ token: string; partnerId: string }> => {
  const { username, password } = ensureCredentials();

  try {
    console.log("Phenix: Tentative d'authentification...");

    const response = await axios.post(
      `${BASE_URL}/Auth/authenticate`,
      { username, password },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Phenix: Réponse d'authentification reçue", response.data);

    const token = response.data.access_token || response.data.token || response.data.jwt;

    if (!token) {
      console.error("Phenix: Structure de réponse inattendue:", response.data);
      throw new Error("Token d'accès (access_token) non trouvé dans la réponse");
    }

    // Extraire PartenaireId directement du JWT
    const payload = decodeJwtPayload(token);
    const partnerId = payload?.PartenaireId || payload?.partenaireId || payload?.PartnerId;

    if (!partnerId) {
      console.error("Phenix: PartenaireId non trouvé dans le JWT:", payload);
      throw new Error("PartenaireId non trouvé dans le token JWT");
    }

    authToken = token;
    cachedPartnerId = partnerId;

    console.log("Phenix: Authentification réussie");
    console.log("Phenix: PartenaireId extrait du JWT:", partnerId);
    console.log("Phenix: Expires in:", response.data.expires_in, "secondes");

    return { token, partnerId };
  } catch (error: any) {
    console.error("Phenix authentication error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    const errorMsg = error.response?.data?.message ||
                     error.response?.data?.error ||
                     error.message ||
                     "Erreur d'authentification inconnue";

    throw new Error(`Échec authentification Phenix: ${errorMsg}`);
  }
};

const ensureAuthenticated = async (): Promise<{ token: string; partnerId: string }> => {
  if (!authToken || !cachedPartnerId) {
    return await authenticatePhenix();
  }
  return { token: authToken, partnerId: cachedPartnerId };
};

export const listPhenixSims = async (): Promise<PhenixSim[]> => {
  const { token, partnerId } = await ensureAuthenticated();

  try {
    console.log("Phenix: Récupération de la liste des SIMs...");
    console.log("Phenix: PartenaireId (from JWT):", partnerId);

    const response = await axios.get(`${BASE_URL}/GsmApi/V2/GetInfoSimList`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: { partenaireId: partnerId },
    });

    console.log("Phenix: Réponse GetInfoSimList:", response.data);

    const sims = response.data.sims || response.data.Sims || response.data || [];

    if (!Array.isArray(sims)) {
      console.error("Phenix: La réponse n'est pas un tableau:", sims);
      return [];
    }

    console.log(`Phenix: ${sims.length} SIM(s) trouvée(s)`);

    return sims.map((sim: any) => ({
      iccid: sim.simSN || sim.iccid || sim.Iccid || "",
      imsi: sim.imsi || sim.Imsi || "",
      msisdn: sim.msisdn || sim.Msisdn || "",
      status: String(sim.etat ?? sim.status ?? sim.Status ?? ""),
      statusLabel: sim.etatLibelle || sim.statusLabel || "Inconnu",
      operator: sim.operateur || sim.operator || "",
      simType: sim.typeSim || sim.simType || "",
      puk1: sim.puk1 || "",
      pin1: sim.pin1 || "",
      puk2: sim.puk2 || "",
      pin2: sim.pin2 || "",
      clientCode: sim.codeClient || sim.clientCode || "",
      orderId: String(sim.commandeSimId || sim.orderId || ""),
      rawData: sim,
    }));
  } catch (error: any) {
    console.error("Phenix list SIMs error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getPhenixSimStatus = async (msisdn: string): Promise<PhenixSim | null> => {
  const { token, partnerId } = await ensureAuthenticated();

  try {
    console.log(`Phenix: Consultation du statut de la ligne ${msisdn}...`);
    const response = await axios.get(`${BASE_URL}/GsmApi/V2/MsisdnConsult`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: { msisdn, partenaireId: partnerId },
    });

    console.log("Phenix: Statut reçu:", response.data);
    const data = response.data;

    return {
      iccid: data.simSN || data.iccid || "",
      imsi: data.imsi || "",
      msisdn: data.msisdn || msisdn,
      status: String(data.etat ?? data.status ?? ""),
      statusLabel: data.etatLibelle || "Inconnu",
      operator: data.operateur || "",
      simType: data.typeSim || "",
      puk1: data.puk1 || "",
      pin1: data.pin1 || "",
      puk2: data.puk2 || "",
      pin2: data.pin2 || "",
      clientCode: data.codeClient || "",
      orderId: String(data.commandeSimId || ""),
      rawData: data,
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
  const { token, partnerId } = await ensureAuthenticated();

  try {
    const response = await axios.post(
      `${BASE_URL}/GsmApi/V2/SdtrConso`,
      { partenaireId: partnerId, msisdn },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
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
  const { token, partnerId } = await ensureAuthenticated();

  try {
    const response = await axios.get(`${BASE_URL}/GsmApi/GetConsoMsisdnFromCDR`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        partenaireId: partnerId,
        msisdn,
        moisAnnee: `${String(month).padStart(2, '0')}${year}`,
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
 */
export const rechargePhenixSim = async (
  msisdn: string,
  volumeMB: number,
  codeZone: string = "ZoneC"
): Promise<boolean> => {
  const { token, partnerId } = await ensureAuthenticated();

  try {
    console.log(`Phenix: Recharge de ${volumeMB} MB pour ${msisdn} (Zone: ${codeZone})`);

    const response = await axios.post(
      `${BASE_URL}/GsmApi/V2/MsisdnAddDataRecharge`,
      { partenaireId: partnerId, msisdn, volumeDataEnMo: volumeMB, codeZone },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
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

/**
 * Force la réauthentification (utile pour rafraîchir le token)
 */
export const refreshPhenixAuth = async (): Promise<void> => {
  authToken = null;
  cachedPartnerId = null;
  await authenticatePhenix();
};
