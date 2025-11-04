import { OperatorInfo } from "../types/operator.types";
import { findOperatorByCode } from "../data/operator-mapping";
import {
  getThingsMobileCdr,
  getThingsMobileSimStatus,
  ThingsMobileCdrParams,
} from "./ThingsMobileService";
import { getPhenixSimStatus } from "./PhenixService";
import { getTruphoneSimStatus } from "./TruphoneService";

/**
 * Service de détection des opérateurs pour les cartes SIM IoT
 */
export class OperatorDetectionService {
  private static instance: OperatorDetectionService;

  public static getInstance(): OperatorDetectionService {
    if (!OperatorDetectionService.instance) {
      OperatorDetectionService.instance = new OperatorDetectionService();
    }
    return OperatorDetectionService.instance;
  }

  /**
   * Détecte l'opérateur d'une SIM Things Mobile via les CDR
   * C'est la méthode la plus fiable pour Things Mobile
   */
  async detectThingsMobileOperator(msisdn: string): Promise<OperatorInfo | null> {
    try {
      // Récupérer les CDR des 7 derniers jours
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const params: ThingsMobileCdrParams = {
        msisdnList: msisdn,
        startDateRange: this.formatDateForThingsMobile(startDate),
        endDateRange: this.formatDateForThingsMobile(endDate),
        page: 1,
        pageSize: 10, // On ne récupère que les 10 dernières entrées
      };

      const cdrResponse = await getThingsMobileCdr(params);

      if (!cdrResponse.entries || cdrResponse.entries.length === 0) {
        console.log(`No CDR found for MSISDN ${msisdn}`);
        return null;
      }

      // Prendre l'entrée la plus récente
      const latestCdr = cdrResponse.entries[0];
      const operatorCode = latestCdr.operator;

      if (!operatorCode) {
        return null;
      }

      const operator = findOperatorByCode(operatorCode);

      return {
        code: operatorCode,
        operator: operator,
        country: latestCdr.country,
        lastSeen: latestCdr.timestamp,
      };
    } catch (error) {
      console.error(
        `Error detecting operator for Things Mobile SIM ${msisdn}:`,
        error
      );
      return null;
    }
  }

  /**
   * Détecte l'opérateur via le statut de la SIM (méthode alternative pour Things Mobile)
   */
  async detectThingsMobileOperatorFromStatus(
    msisdn: string
  ): Promise<OperatorInfo | null> {
    try {
      const simStatus = await getThingsMobileSimStatus({ msisdn });

      if (!simStatus) {
        return null;
      }

      // Things Mobile peut inclure des informations d'opérateur dans le statut
      // mais cela dépend de la structure exacte de la réponse API
      // Cette méthode est moins fiable que les CDR

      // Pour l'instant, on retourne null et on privilégie les CDR
      return null;
    } catch (error) {
      console.error(
        `Error getting status for Things Mobile SIM ${msisdn}:`,
        error
      );
      return null;
    }
  }

  /**
   * Détecte l'opérateur d'une SIM Phenix
   * Note: La disponibilité de cette information dépend de l'API Phenix
   */
  async detectPhenixOperator(msisdn: string): Promise<OperatorInfo | null> {
    try {
      const simStatus = await getPhenixSimStatus(msisdn);

      if (!simStatus) {
        return null;
      }

      // L'API Phenix peut retourner des informations sur l'opérateur
      // dans le statut de la SIM - à adapter selon la structure réelle
      // de la réponse API

      // Pour l'instant, on retourne null car la structure exacte
      // n'est pas documentée
      return null;
    } catch (error) {
      console.error(`Error detecting operator for Phenix SIM ${msisdn}:`, error);
      return null;
    }
  }

  /**
   * Détecte l'opérateur d'une SIM Truphone
   * Note: La disponibilité de cette information dépend de l'API Truphone
   */
  async detectTruphoneOperator(iccid: string): Promise<OperatorInfo | null> {
    try {
      const simStatus = await getTruphoneSimStatus(iccid);

      if (!simStatus) {
        return null;
      }

      // L'API Truphone peut retourner des informations sur l'opérateur
      // dans le statut de la SIM - à adapter selon la structure réelle
      // de la réponse API

      // Pour l'instant, on retourne null car la structure exacte
      // n'est pas documentée
      return null;
    } catch (error) {
      console.error(
        `Error detecting operator for Truphone SIM ${iccid}:`,
        error
      );
      return null;
    }
  }

  /**
   * Détecte l'opérateur d'une SIM quelle que soit la plateforme
   */
  async detectOperator(
    platform: "thingsmobile" | "phenix" | "truphone",
    identifier: string // MSISDN ou ICCID selon la plateforme
  ): Promise<OperatorInfo | null> {
    switch (platform) {
      case "thingsmobile":
        // Pour Things Mobile, on essaie d'abord les CDR (plus fiable)
        const cdrOperator = await this.detectThingsMobileOperator(identifier);
        if (cdrOperator) {
          return cdrOperator;
        }
        // Si les CDR ne donnent rien, on essaie le statut
        return await this.detectThingsMobileOperatorFromStatus(identifier);

      case "phenix":
        return await this.detectPhenixOperator(identifier);

      case "truphone":
        return await this.detectTruphoneOperator(identifier);

      default:
        console.error(`Unknown platform: ${platform}`);
        return null;
    }
  }

  /**
   * Détecte les opérateurs pour plusieurs SIMs en parallèle
   * Avec limitation du nombre de requêtes simultanées pour éviter les rate limits
   */
  async detectOperatorsForMultipleSims(
    sims: Array<{
      platform: "thingsmobile" | "phenix" | "truphone";
      identifier: string;
    }>,
    concurrency: number = 5
  ): Promise<Map<string, OperatorInfo | null>> {
    const results = new Map<string, OperatorInfo | null>();

    // Traiter les SIMs par batch pour respecter les limites d'API
    for (let i = 0; i < sims.length; i += concurrency) {
      const batch = sims.slice(i, i + concurrency);

      const promises = batch.map(async (sim) => {
        const operatorInfo = await this.detectOperator(
          sim.platform,
          sim.identifier
        );
        results.set(sim.identifier, operatorInfo);

        // Attendre 1 seconde entre chaque requête pour respecter les limites API
        await this.sleep(1000);
      });

      await Promise.all(promises);
    }

    return results;
  }

  /**
   * Formate une date au format attendu par Things Mobile API
   */
  private formatDateForThingsMobile(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Utilitaire pour ajouter un délai
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Extrait le code opérateur d'un IMSI
   * L'IMSI contient le MCC (Mobile Country Code) et le MNC (Mobile Network Code)
   * Format: MCCMNC + numéro d'abonné
   */
  extractOperatorFromImsi(imsi: string): OperatorInfo | null {
    if (!imsi || imsi.length < 5) {
      return null;
    }

    // Les 3 premiers chiffres sont le MCC
    const mcc = imsi.substring(0, 3);

    // Les 2 ou 3 chiffres suivants sont le MNC
    // On essaie d'abord avec 2 chiffres, puis 3
    let mnc = imsi.substring(3, 5);
    let operator = findOperatorByCode(`${mcc}${mnc}`);

    if (!operator && imsi.length >= 6) {
      mnc = imsi.substring(3, 6);
      operator = findOperatorByCode(`${mcc}${mnc}`);
    }

    if (operator) {
      return {
        code: `${mcc}${mnc}`,
        operator: operator,
      };
    }

    return null;
  }
}
