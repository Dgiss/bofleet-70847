import {
  SimWithOperator,
  OperatorGroup,
  OperatorStats,
  OperatorInfo,
} from "../types/operator.types";
import { listThingsMobileSims } from "./ThingsMobileService";
import { listPhenixSims } from "./PhenixService";
import { listTruphoneSims } from "./TruphoneService";
import { OperatorDetectionService } from "./OperatorDetectionService";
import { getOperatorDisplayName } from "../data/operator-mapping";

/**
 * Service unifié pour la gestion des SIMs avec leurs opérateurs
 */
export class SimOperatorService {
  private static instance: SimOperatorService;
  private operatorDetection: OperatorDetectionService;

  private constructor() {
    this.operatorDetection = OperatorDetectionService.getInstance();
  }

  public static getInstance(): SimOperatorService {
    if (!SimOperatorService.instance) {
      SimOperatorService.instance = new SimOperatorService();
    }
    return SimOperatorService.instance;
  }

  /**
   * Récupère toutes les SIMs de toutes les plateformes
   */
  async getAllSims(): Promise<SimWithOperator[]> {
    const allSims: SimWithOperator[] = [];

    try {
      // Récupérer les SIMs Things Mobile
      console.log("Récupération des SIMs Things Mobile...");
      const thingsMobileSims = await listThingsMobileSims({ pageSize: 500 });
      thingsMobileSims.sims.forEach((sim) => {
        allSims.push({
          iccid: sim.iccid,
          msisdn: sim.msisdn,
          platform: "thingsmobile",
          status: sim.status,
          name: sim.name,
          tag: sim.tag,
          lastConnectionDate: sim.lastConnectionDate,
        });
      });
      console.log(`${thingsMobileSims.sims.length} SIMs Things Mobile trouvées`);
    } catch (error) {
      console.error("Erreur lors de la récupération des SIMs Things Mobile:", error);
    }

    try {
      // Récupérer les SIMs Phenix
      console.log("Récupération des SIMs Phenix...");
      const phenixSims = await listPhenixSims();
      phenixSims.forEach((sim) => {
        allSims.push({
          iccid: sim.iccid,
          msisdn: sim.msisdn,
          platform: "phenix",
          status: sim.status,
        });
      });
      console.log(`${phenixSims.length} SIMs Phenix trouvées`);
    } catch (error) {
      console.error("Erreur lors de la récupération des SIMs Phenix:", error);
    }

    try {
      // Récupérer les SIMs Truphone
      console.log("Récupération des SIMs Truphone...");
      const truphoneSims = await listTruphoneSims();
      truphoneSims.forEach((sim) => {
        allSims.push({
          iccid: sim.iccid,
          msisdn: sim.msisdn || "",
          platform: "truphone",
          status: sim.status,
        });
      });
      console.log(`${truphoneSims.length} SIMs Truphone trouvées`);
    } catch (error) {
      console.error("Erreur lors de la récupération des SIMs Truphone:", error);
    }

    console.log(`Total: ${allSims.length} SIMs récupérées`);
    return allSims;
  }

  /**
   * Détecte les opérateurs pour toutes les SIMs
   */
  async detectOperatorsForAllSims(
    sims: SimWithOperator[]
  ): Promise<SimWithOperator[]> {
    console.log(`Détection des opérateurs pour ${sims.length} SIMs...`);

    // Préparer les requêtes de détection
    const detectionRequests = sims.map((sim) => ({
      platform: sim.platform,
      identifier: sim.platform === "truphone" ? sim.iccid : sim.msisdn,
    }));

    // Détecter les opérateurs (avec limitation de concurrence)
    const operatorMap = await this.operatorDetection.detectOperatorsForMultipleSims(
      detectionRequests,
      3 // Max 3 requêtes simultanées
    );

    // Ajouter les informations d'opérateur aux SIMs
    const simsWithOperators = sims.map((sim) => {
      const identifier = sim.platform === "truphone" ? sim.iccid : sim.msisdn;
      const operatorInfo = operatorMap.get(identifier);

      return {
        ...sim,
        currentOperator: operatorInfo || undefined,
      };
    });

    console.log("Détection des opérateurs terminée");
    return simsWithOperators;
  }

  /**
   * Récupère toutes les SIMs avec leurs opérateurs
   */
  async getAllSimsWithOperators(): Promise<SimWithOperator[]> {
    const sims = await this.getAllSims();
    return await this.detectOperatorsForAllSims(sims);
  }

  /**
   * Groupe les SIMs par opérateur
   */
  groupSimsByOperator(sims: SimWithOperator[]): Map<string, OperatorGroup> {
    const groups = new Map<string, OperatorGroup>();

    sims.forEach((sim) => {
      const operatorCode = sim.currentOperator?.code || "UNKNOWN";

      if (!groups.has(operatorCode)) {
        groups.set(operatorCode, {
          operator: sim.currentOperator?.operator || null,
          operatorCode: operatorCode,
          sims: [],
          count: 0,
        });
      }

      const group = groups.get(operatorCode)!;
      group.sims.push(sim);
      group.count++;
    });

    return groups;
  }

  /**
   * Obtient des statistiques sur les opérateurs
   */
  async getOperatorStats(): Promise<OperatorStats> {
    const sims = await this.getAllSimsWithOperators();
    const groupedByOperator = this.groupSimsByOperator(sims);

    const unknownOperators: string[] = [];
    groupedByOperator.forEach((group, code) => {
      if (!group.operator) {
        unknownOperators.push(code);
      }
    });

    return {
      totalSims: sims.length,
      byOperator: groupedByOperator,
      unknownOperators: unknownOperators,
      lastUpdated: new Date(),
    };
  }

  /**
   * Recherche des SIMs par opérateur
   */
  async findSimsByOperator(operatorCode: string): Promise<SimWithOperator[]> {
    const sims = await this.getAllSimsWithOperators();
    return sims.filter(
      (sim) => sim.currentOperator?.code === operatorCode.toUpperCase()
    );
  }

  /**
   * Recherche des SIMs par pays
   */
  async findSimsByCountry(countryCode: string): Promise<SimWithOperator[]> {
    const sims = await this.getAllSimsWithOperators();
    return sims.filter(
      (sim) =>
        sim.currentOperator?.operator?.countryCode === countryCode.toUpperCase()
    );
  }

  /**
   * Recherche des SIMs par plateforme
   */
  async findSimsByPlatform(
    platform: "thingsmobile" | "phenix" | "truphone"
  ): Promise<SimWithOperator[]> {
    const sims = await this.getAllSims();
    return sims.filter((sim) => sim.platform === platform);
  }

  /**
   * Exporte les SIMs groupées par opérateur au format JSON
   */
  async exportSimsByOperatorAsJson(): Promise<string> {
    const stats = await this.getOperatorStats();

    const exportData: Record<string, any> = {
      generatedAt: stats.lastUpdated.toISOString(),
      totalSims: stats.totalSims,
      operators: {},
    };

    stats.byOperator.forEach((group, code) => {
      const operatorName = group.operator
        ? getOperatorDisplayName(code)
        : `Unknown (${code})`;

      exportData.operators[operatorName] = {
        code: code,
        count: group.count,
        country: group.operator?.country || "Unknown",
        sims: group.sims.map((sim) => ({
          iccid: sim.iccid,
          msisdn: sim.msisdn,
          platform: sim.platform,
          status: sim.status,
          name: sim.name,
          tag: sim.tag,
        })),
      };
    });

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Exporte les SIMs groupées par opérateur au format CSV
   */
  async exportSimsByOperatorAsCsv(): Promise<string> {
    const sims = await this.getAllSimsWithOperators();

    const headers = [
      "ICCID",
      "MSISDN",
      "Platform",
      "Status",
      "Operator Code",
      "Operator Name",
      "Country",
      "Name",
      "Tag",
    ];

    const rows = sims.map((sim) => {
      const operatorName = sim.currentOperator?.operator?.name || "Unknown";
      const operatorCode = sim.currentOperator?.code || "UNKNOWN";
      const country = sim.currentOperator?.operator?.country || "Unknown";

      return [
        sim.iccid,
        sim.msisdn,
        sim.platform,
        sim.status,
        operatorCode,
        operatorName,
        country,
        sim.name || "",
        sim.tag || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  }

  /**
   * Obtient un résumé par opérateur (pour affichage)
   */
  async getOperatorSummary(): Promise<
    Array<{
      operatorCode: string;
      operatorName: string;
      country: string;
      simCount: number;
      platforms: Record<string, number>;
    }>
  > {
    const stats = await this.getOperatorStats();
    const summary: Array<{
      operatorCode: string;
      operatorName: string;
      country: string;
      simCount: number;
      platforms: Record<string, number>;
    }> = [];

    stats.byOperator.forEach((group, code) => {
      const platforms: Record<string, number> = {
        thingsmobile: 0,
        phenix: 0,
        truphone: 0,
      };

      group.sims.forEach((sim) => {
        platforms[sim.platform]++;
      });

      summary.push({
        operatorCode: code,
        operatorName: group.operator?.name || "Unknown",
        country: group.operator?.country || "Unknown",
        simCount: group.count,
        platforms: platforms,
      });
    });

    // Trier par nombre de SIMs (décroissant)
    summary.sort((a, b) => b.simCount - a.simCount);

    return summary;
  }
}
