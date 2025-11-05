import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const BASE_URL = "/api/thingsmobile/services/business-api";
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseAttributeValue: true,
  textNodeName: "value",
  trimValues: true,
});

export interface ThingsMobileSim {
  msisdn: string;
  iccid: string;
  status: string;
  name?: string;
  tag?: string;
  balanceBytes?: number;
  activationDate?: string;
  expirationDate?: string;
  lastConnectionDate?: string;
  monthlyTrafficBytes?: number;
  dailyTrafficBytes?: number;
}

export interface ThingsMobileListResponse {
  sims: ThingsMobileSim[];
  page: number;
  pageSize: number;
  totalCount?: number;
  hasMore: boolean;
}

export interface ThingsMobileListParams {
  status?: string;
  page?: number;
  pageSize?: number;
  name?: string;
  tag?: string;
}

export interface ThingsMobileStatusParams {
  msisdn?: string;
  iccid?: string;
}

export interface ThingsMobileCdrParams {
  msisdnList: string; // Liste des MSISDN séparés par des virgules
  startDateRange: string; // Format: YYYY-MM-DD HH:mm:ss
  endDateRange: string; // Format: YYYY-MM-DD HH:mm:ss
  page?: number;
  pageSize?: number;
}

export interface ThingsMobileCdrEntry {
  msisdn: string;
  timestamp: string;
  dataVolume: number; // en bytes
  type: string; // Type de connexion
  country?: string;
  operator?: string;
}

export interface ThingsMobileCdrResponse {
  entries: ThingsMobileCdrEntry[];
  page: number;
  pageSize: number;
  totalCount?: number;
  hasMore: boolean;
}

const ensureCredentials = () => {
  const username = import.meta.env.VITE_THINGSMOBILE_USERNAME;
  const token = import.meta.env.VITE_THINGSMOBILE_TOKEN;

  if (!username || !token) {
    throw new Error(
      "Things Mobile credentials missing. Please define VITE_THINGSMOBILE_USERNAME and VITE_THINGSMOBILE_TOKEN in your environment."
    );
  }

  return { username, token };
};

const callThingsMobileApi = async (endpoint: string, params: Record<string, string | number | undefined>) => {
  const { username, token } = ensureCredentials();

  const body = new URLSearchParams();
  body.append("username", username);
  body.append("token", token);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      body.append(key, String(value));
    }
  });

  const response = await axios.post(`${BASE_URL}/${endpoint}`, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const parsed = parser.parse(response.data);
  const result = parsed?.result;

  if (!result) {
    throw new Error("Réponse Things Mobile invalide.");
  }

  if (String(result.done).toLowerCase() !== "true") {
    const message = result?.message || "La requête Things Mobile a échoué.";
    throw new Error(typeof message === "string" ? message : "La requête Things Mobile a échoué.");
  }

  return result;
};

const normalizeSimNode = (node: any): ThingsMobileSim => {
  const normalizeNumber = (value: any): number | undefined => {
    if (value === undefined || value === null) return undefined;
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : undefined;
  };

  return {
    msisdn: node?.msisdn ?? "",
    iccid: node?.iccid ?? "",
    status: node?.status ?? "",
    name: node?.name ?? undefined,
    tag: node?.tag ?? undefined,
    balanceBytes: normalizeNumber(node?.balance),
    activationDate: node?.activationDate ?? undefined,
    expirationDate: node?.expirationDate ?? undefined,
    lastConnectionDate: node?.lastConnectionDate ?? undefined,
    monthlyTrafficBytes: normalizeNumber(node?.monthlyTraffic),
    dailyTrafficBytes: normalizeNumber(node?.dailyTraffic),
  };
};

export const listThingsMobileSims = async (params: ThingsMobileListParams = {}): Promise<ThingsMobileListResponse> => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize || 100;

  const result = await callThingsMobileApi("simListLite", {
    ...params,
    page,
    pageSize,
  });

  const simsNode = result?.sims?.sim ?? [];
  const simsArray = Array.isArray(simsNode) ? simsNode : simsNode ? [simsNode] : [];
  const sims = simsArray.map(normalizeSimNode).filter((sim) => sim.msisdn || sim.iccid);

  const pagination = result?.pagination || result?.pageData || {};
  const total = Number(pagination?.totalRecords || pagination?.totalCount);
  const totalPages = Number(pagination?.totalPages);
  const hasMore =
    totalPages && Number.isFinite(totalPages)
      ? page < totalPages
      : typeof result?.nextPage !== "undefined"
        ? Boolean(result?.nextPage)
        : sims.length === pageSize;

  return {
    sims,
    page,
    pageSize,
    totalCount: Number.isFinite(total) ? total : undefined,
    hasMore,
  };
};

export const getThingsMobileSimStatus = async (
  params: ThingsMobileStatusParams
): Promise<ThingsMobileSim | null> => {
  if (!params.msisdn && !params.iccid) {
    throw new Error("Merci de renseigner un MSISDN ou un ICCID.");
  }

  const result = await callThingsMobileApi("simStatus", params as Record<string, string | number | undefined>);
  const simsNode = result?.sims?.sim;
  if (!simsNode) {
    return null;
  }

  const simNode = Array.isArray(simsNode) ? simsNode[0] : simsNode;
  return normalizeSimNode(simNode);
};

export const getThingsMobileCdr = async (
  params: ThingsMobileCdrParams
): Promise<ThingsMobileCdrResponse> => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize || 500;

  const result = await callThingsMobileApi("getCdrPaginated", {
    msisdnList: params.msisdnList,
    startDateRange: params.startDateRange,
    endDateRange: params.endDateRange,
    page,
    pageSize,
  });

  const cdrNode = result?.cdrs?.cdr ?? [];
  const cdrArray = Array.isArray(cdrNode) ? cdrNode : cdrNode ? [cdrNode] : [];

  const entries: ThingsMobileCdrEntry[] = cdrArray.map((entry: any) => ({
    msisdn: entry?.msisdn ?? "",
    timestamp: entry?.timestamp ?? entry?.date ?? "",
    dataVolume: Number(entry?.dataVolume ?? entry?.volume ?? 0),
    type: entry?.type ?? "data",
    country: entry?.country ?? undefined,
    operator: entry?.operator ?? undefined,
  }));

  const pagination = result?.pagination || {};
  const total = Number(pagination?.totalRecords || pagination?.totalCount || 0);
  const totalPages = Number(pagination?.totalPages || 0);
  const hasMore = totalPages > 0 ? page < totalPages : entries.length === pageSize;

  return {
    entries,
    page,
    pageSize,
    totalCount: total > 0 ? total : undefined,
    hasMore,
  };
};

/**
 * Recharge une carte SIM Things Mobile avec des données
 *
 * Documentation: Things Mobile API v1.52, section 4.18
 * Endpoint: https://api.thingsmobile.com/services/business-api/rechargeSim
 *
 * @param msisdn - Numéro MSISDN de la carte SIM (optionnel si iccid fourni)
 * @param volumeMB - Volume de données à ajouter en MB (maximum: 1000 MB)
 * @param iccid - ICCID de la carte SIM (optionnel si msisdn fourni)
 * @returns true si la recharge réussit, false sinon
 * @throws Error si les credentials ne sont pas configurés ou si les paramètres sont invalides
 */
export const rechargeThingsMobileSim = async (
  msisdn: string,
  volumeMB: number,
  iccid?: string
): Promise<boolean> => {
  if (!msisdn && !iccid) {
    throw new Error("Au moins un paramètre (MSISDN ou ICCID) est requis pour la recharge");
  }

  if (volumeMB <= 0 || volumeMB > 1000) {
    throw new Error("Le volume de recharge doit être entre 1 et 1000 MB");
  }

  console.log(`Things Mobile: Recharge de ${volumeMB} MB pour ${msisdn || iccid}...`);

  try {
    const params: Record<string, string | number> = {
      amount: volumeMB,
    };

    if (msisdn) {
      params.msisdn = msisdn;
    }
    if (iccid) {
      params.iccid = iccid;
    }

    const result = await callThingsMobileApi("rechargeSim", params);

    if (result && String(result.done).toLowerCase() === "true") {
      console.log(`✅ Things Mobile: Recharge réussie pour ${msisdn || iccid}`);
      return true;
    }

    console.error("Things Mobile: Recharge échouée", result);
    return false;
  } catch (error: any) {
    console.error("Things Mobile recharge error:", {
      message: error.message,
      msisdn: msisdn || "N/A",
      iccid: iccid || "N/A",
      volumeMB,
    });
    throw error;
  }
};
