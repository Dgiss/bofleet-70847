import { Operator } from "../types/operator.types";

/**
 * Base de données des opérateurs de télécommunications
 * Codes opérateurs couramment rencontrés dans les réseaux IoT
 */
export const OPERATOR_DATABASE: Record<string, Operator> = {
  // --- ITALIE ---
  "ITAWI": {
    code: "ITAWI",
    name: "Wind Tre",
    country: "Italy",
    countryCode: "IT",
    mcc: "222",
    mnc: "88",
  },
  "ITATM": {
    code: "ITATM",
    name: "TIM (Telecom Italia Mobile)",
    country: "Italy",
    countryCode: "IT",
    mcc: "222",
    mnc: "01",
  },
  "ITAVF": {
    code: "ITAVF",
    name: "Vodafone Italia",
    country: "Italy",
    countryCode: "IT",
    mcc: "222",
    mnc: "10",
  },

  // --- ESPAGNE ---
  "ESPVV": {
    code: "ESPVV",
    name: "Vodafone España",
    country: "Spain",
    countryCode: "ES",
    mcc: "214",
    mnc: "01",
  },
  "ESPMF": {
    code: "ESPMF",
    name: "Movistar (Telefónica)",
    country: "Spain",
    countryCode: "ES",
    mcc: "214",
    mnc: "07",
  },
  "ESPMF2": {
    code: "ESPMF2",
    name: "Orange España",
    country: "Spain",
    countryCode: "ES",
    mcc: "214",
    mnc: "03",
  },

  // --- FRANCE ---
  "FRAOR": {
    code: "FRAOR",
    name: "Orange France",
    country: "France",
    countryCode: "FR",
    mcc: "208",
    mnc: "01",
  },
  "FRASFR": {
    code: "FRASFR",
    name: "SFR",
    country: "France",
    countryCode: "FR",
    mcc: "208",
    mnc: "10",
  },
  "FRABG": {
    code: "FRABG",
    name: "Bouygues Telecom",
    country: "France",
    countryCode: "FR",
    mcc: "208",
    mnc: "20",
  },
  "FRAFR": {
    code: "FRAFR",
    name: "Free Mobile",
    country: "France",
    countryCode: "FR",
    mcc: "208",
    mnc: "15",
  },

  // --- ALLEMAGNE ---
  "DEUD1": {
    code: "DEUD1",
    name: "T-Mobile Deutschland",
    country: "Germany",
    countryCode: "DE",
    mcc: "262",
    mnc: "01",
  },
  "DEUVF": {
    code: "DEUVF",
    name: "Vodafone Deutschland",
    country: "Germany",
    countryCode: "DE",
    mcc: "262",
    mnc: "02",
  },
  "DEUO2": {
    code: "DEUO2",
    name: "O2 Germany",
    country: "Germany",
    countryCode: "DE",
    mcc: "262",
    mnc: "07",
  },

  // --- ROYAUME-UNI ---
  "GBROR": {
    code: "GBROR",
    name: "EE (Everything Everywhere)",
    country: "United Kingdom",
    countryCode: "GB",
    mcc: "234",
    mnc: "30",
  },
  "GBRVF": {
    code: "GBRVF",
    name: "Vodafone UK",
    country: "United Kingdom",
    countryCode: "GB",
    mcc: "234",
    mnc: "15",
  },
  "GBRO2": {
    code: "GBRO2",
    name: "O2 UK",
    country: "United Kingdom",
    countryCode: "GB",
    mcc: "234",
    mnc: "10",
  },
  "GBR3": {
    code: "GBR3",
    name: "Three UK",
    country: "United Kingdom",
    countryCode: "GB",
    mcc: "234",
    mnc: "20",
  },

  // --- BELGIQUE ---
  "BELPX": {
    code: "BELPX",
    name: "Proximus",
    country: "Belgium",
    countryCode: "BE",
    mcc: "206",
    mnc: "01",
  },
  "BELBAS": {
    code: "BELBAS",
    name: "Orange Belgium",
    country: "Belgium",
    countryCode: "BE",
    mcc: "206",
    mnc: "10",
  },
  "BELTMB": {
    code: "BELTMB",
    name: "Telenet",
    country: "Belgium",
    countryCode: "BE",
    mcc: "206",
    mnc: "05",
  },

  // --- PAYS-BAS ---
  "NLDKPN": {
    code: "NLDKPN",
    name: "KPN",
    country: "Netherlands",
    countryCode: "NL",
    mcc: "204",
    mnc: "08",
  },
  "NLDVF": {
    code: "NLDVF",
    name: "Vodafone Netherlands",
    country: "Netherlands",
    countryCode: "NL",
    mcc: "204",
    mnc: "04",
  },
  "NLDT": {
    code: "NLDT",
    name: "T-Mobile Netherlands",
    country: "Netherlands",
    countryCode: "NL",
    mcc: "204",
    mnc: "16",
  },

  // --- SUISSE ---
  "CHESWC": {
    code: "CHESWC",
    name: "Swisscom",
    country: "Switzerland",
    countryCode: "CH",
    mcc: "228",
    mnc: "01",
  },
  "CHESUN": {
    code: "CHESUN",
    name: "Sunrise",
    country: "Switzerland",
    countryCode: "CH",
    mcc: "228",
    mnc: "02",
  },
  "CHESLT": {
    code: "CHESLT",
    name: "Salt Mobile",
    country: "Switzerland",
    countryCode: "CH",
    mcc: "228",
    mnc: "03",
  },

  // --- PORTUGAL ---
  "PRTVF": {
    code: "PRTVF",
    name: "Vodafone Portugal",
    country: "Portugal",
    countryCode: "PT",
    mcc: "268",
    mnc: "01",
  },
  "PRTTMN": {
    code: "PRTTMN",
    name: "MEO (Portugal Telecom)",
    country: "Portugal",
    countryCode: "PT",
    mcc: "268",
    mnc: "06",
  },
  "PRTOPT": {
    code: "PRTOPT",
    name: "NOS",
    country: "Portugal",
    countryCode: "PT",
    mcc: "268",
    mnc: "03",
  },

  // --- AUTRICHE ---
  "AUTA1": {
    code: "AUTA1",
    name: "A1 Telekom Austria",
    country: "Austria",
    countryCode: "AT",
    mcc: "232",
    mnc: "01",
  },
  "AUTT": {
    code: "AUTT",
    name: "T-Mobile Austria",
    country: "Austria",
    countryCode: "AT",
    mcc: "232",
    mnc: "03",
  },
  "AUT3": {
    code: "AUT3",
    name: "Hutchison Drei Austria",
    country: "Austria",
    countryCode: "AT",
    mcc: "232",
    mnc: "05",
  },

  // --- POLOGNE ---
  "POLPLS": {
    code: "POLPLS",
    name: "Play",
    country: "Poland",
    countryCode: "PL",
    mcc: "260",
    mnc: "06",
  },
  "POLOR": {
    code: "POLOR",
    name: "Orange Polska",
    country: "Poland",
    countryCode: "PL",
    mcc: "260",
    mnc: "03",
  },
  "POLTMB": {
    code: "POLTMB",
    name: "T-Mobile Poland",
    country: "Poland",
    countryCode: "PL",
    mcc: "260",
    mnc: "02",
  },

  // --- RÉPUBLIQUE TCHÈQUE ---
  "CZEO2": {
    code: "CZEO2",
    name: "O2 Czech Republic",
    country: "Czech Republic",
    countryCode: "CZ",
    mcc: "230",
    mnc: "02",
  },
  "CZET": {
    code: "CZET",
    name: "T-Mobile Czech Republic",
    country: "Czech Republic",
    countryCode: "CZ",
    mcc: "230",
    mnc: "01",
  },
  "CZEVF": {
    code: "CZEVF",
    name: "Vodafone Czech Republic",
    country: "Czech Republic",
    countryCode: "CZ",
    mcc: "230",
    mnc: "03",
  },

  // --- SUÈDE ---
  "SWETELE": {
    code: "SWETELE",
    name: "Telia Sweden",
    country: "Sweden",
    countryCode: "SE",
    mcc: "240",
    mnc: "01",
  },
  "SWETELE2": {
    code: "SWETELE2",
    name: "Telenor Sweden",
    country: "Sweden",
    countryCode: "SE",
    mcc: "240",
    mnc: "08",
  },
  "SWE3": {
    code: "SWE3",
    name: "3 Sweden (Tre)",
    country: "Sweden",
    countryCode: "SE",
    mcc: "240",
    mnc: "02",
  },

  // --- USA ---
  "USAVZ": {
    code: "USAVZ",
    name: "Verizon Wireless",
    country: "United States",
    countryCode: "US",
    mcc: "311",
    mnc: "480",
  },
  "USATT": {
    code: "USATT",
    name: "AT&T Mobility",
    country: "United States",
    countryCode: "US",
    mcc: "310",
    mnc: "410",
  },
  "USATMB": {
    code: "USATMB",
    name: "T-Mobile US",
    country: "United States",
    countryCode: "US",
    mcc: "310",
    mnc: "260",
  },
};

/**
 * Recherche un opérateur par son code
 */
export function findOperatorByCode(code: string): Operator | null {
  return OPERATOR_DATABASE[code.toUpperCase()] || null;
}

/**
 * Recherche des opérateurs par pays
 */
export function findOperatorsByCountry(countryCode: string): Operator[] {
  return Object.values(OPERATOR_DATABASE).filter(
    (op) => op.countryCode === countryCode.toUpperCase()
  );
}

/**
 * Recherche des opérateurs par MCC+MNC
 */
export function findOperatorByMccMnc(mcc: string, mnc: string): Operator | null {
  return (
    Object.values(OPERATOR_DATABASE).find(
      (op) => op.mcc === mcc && op.mnc === mnc
    ) || null
  );
}

/**
 * Obtient tous les codes pays disponibles
 */
export function getAvailableCountries(): string[] {
  const countries = new Set<string>();
  Object.values(OPERATOR_DATABASE).forEach((op) => {
    countries.add(op.countryCode);
  });
  return Array.from(countries).sort();
}

/**
 * Obtient un nom lisible pour un code opérateur
 * Retourne le code lui-même si l'opérateur n'est pas trouvé
 */
export function getOperatorDisplayName(code: string): string {
  const operator = findOperatorByCode(code);
  return operator ? `${operator.name} (${operator.countryCode})` : code;
}
