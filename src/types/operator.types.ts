/**
 * Types et interfaces pour la gestion des opérateurs de télécommunications
 */

export interface Operator {
  code: string;              // Code opérateur (ex: "ITAWI", "ESPVV")
  name: string;              // Nom complet de l'opérateur (ex: "Wind Italy")
  country: string;           // Pays (ex: "Italy", "Spain")
  countryCode: string;       // Code pays ISO (ex: "IT", "ES")
  mcc?: string;              // Mobile Country Code
  mnc?: string;              // Mobile Network Code
  network?: string;          // Zone réseau (ex: "Zone 1", "Zone Europe")
}

export interface OperatorInfo {
  code: string;              // Code brut de l'opérateur
  operator: Operator | null; // Informations détaillées de l'opérateur (null si inconnu)
  country?: string;          // Pays détecté
  network?: string;          // Zone réseau
  lastSeen?: string;         // Dernière fois que la SIM a été vue sur cet opérateur
}

export interface SimWithOperator {
  // Informations SIM de base
  iccid: string;
  msisdn: string;
  platform: 'thingsmobile' | 'phenix' | 'truphone';
  status: string;

  // Informations opérateur
  currentOperator?: OperatorInfo;
  operatorHistory?: OperatorInfo[];

  // Métadonnées
  name?: string;
  tag?: string;
  lastConnectionDate?: string;
}

export interface OperatorGroup {
  operator: Operator | null;
  operatorCode: string;
  sims: SimWithOperator[];
  count: number;
  totalDataUsage?: number;
}

export interface OperatorStats {
  totalSims: number;
  byOperator: Map<string, OperatorGroup>;
  unknownOperators: string[];
  lastUpdated: Date;
}
