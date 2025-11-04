import { format, subDays, subWeeks, addYears } from "date-fns";

// Define the SIM Card interface
export interface SimCard {
  id: string;
  type: "Truphone" | "Things Mobile" | "Phenix";
  dataPlan: number; // in MB
  dataUsage: number; // in MB
  smsPlan: number;
  smsCount: number;
  callPlan: number; // in minutes
  callDuration: number; // in minutes
  status: "active" | "suspended" | "blocked" | "recharging" | "expired";
  lastActivity: Date;
  rechargePending?: boolean;
  lastRechargeDate?: Date;
  nextRenewalDate?: Date;
  activationDate: Date; // Date d'activation de la carte
  expirationDate: Date; // Date d'expiration (5 ans après activation)
}

// Define thresholds for each type of SIM
export const getThresholds = (type: string) => {
  switch (type) {
    case "Truphone":
      return {
        data: 5000, // 5GB
        sms: 500,
        calls: 300,
      };
    case "Things Mobile":
      return {
        data: 2000, // 2GB
        sms: 200,
        calls: 120,
      };
    case "Phenix":
      return {
        data: 3000, // 3GB
        sms: 300,
        calls: 200,
      };
    default:
      return {
        data: 1000,
        sms: 100,
        calls: 60,
      };
  }
};

// Generate random SIM ID based on type
export const generateSimId = (type: "Truphone" | "Things Mobile" | "Phenix", index: number): string => {
  switch (type) {
    case "Truphone":
      return `8944${String(index).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    case "Things Mobile":
      return `3933${String(index).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    case "Phenix":
      return `3367${String(index).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
};

// Generate random data usage percentage (between 5% and 95% of the plan)
export const generateUsagePercentage = (): number => {
  return 0.05 + Math.random() * 0.9; // Between 5% and 95%
};

// Generate random status
export const generateStatus = (): "active" | "suspended" | "blocked" | "recharging" | "expired" => {
  const statuses: ("active" | "suspended" | "blocked" | "recharging" | "expired")[] = ["active", "suspended", "blocked", "recharging", "expired"];
  const weights = [0.60, 0.15, 0.05, 0.05, 0.15]; // 60% active, 15% suspended, 5% blocked, 5% recharging, 15% expired
  
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < statuses.length; i++) {
    sum += weights[i];
    if (random <= sum) {
      return statuses[i];
    }
  }
  return "active"; // Default
};

// Generate random activation date (between 6 months and 4 years ago)
export const generateActivationDate = (): Date => {
  const now = new Date();
  const monthsAgo = 6 + Math.floor(Math.random() * 42); // Between 6 months and 4 years
  return subDays(now, monthsAgo * 30);
};

// Generate expiration date (5 years after activation)
export const generateExpirationDate = (activationDate: Date): Date => {
  return addYears(activationDate, 5);
};

// Generate random last activity date (between today and 30 days ago)
export const generateLastActivity = (): Date => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  return subDays(now, daysAgo);
};

// Generate next renewal date (between 7 and 30 days from now)
export const generateNextRenewalDate = (): Date => {
  const now = new Date();
  const daysToAdd = 7 + Math.floor(Math.random() * 23); // Between 7 and 30 days
  return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
};

// Format date for display
export const formatDate = (date: Date): string => {
  return format(date, "dd/MM/yyyy HH:mm");
};

// Get display name for SIM type
export const getSimTypeDisplayName = (type: string): string => {
  return type;
};

// Get display name for status
export const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case "active": return "Actif";
    case "suspended": return "Suspendu";
    case "blocked": return "Bloqué";
    case "recharging": return "En recharge";
    case "expired": return "Expiré";
    default: return status;
  }
};

// Check if a SIM card is expired (usage at 100%, past renewal date, or past expiration date)
export const isExpired = (sim: SimCard): boolean => {
  const dataPercentage = (sim.dataUsage / sim.dataPlan) * 100;
  const smsPercentage = (sim.smsCount / sim.smsPlan) * 100;
  const callPercentage = (sim.callDuration / sim.callPlan) * 100;
  
  // Check if any usage is at 100%
  const usageAtMax = dataPercentage >= 100 || smsPercentage >= 100 || callPercentage >= 100;
  
  // Check if renewal date has passed
  const now = new Date();
  const pastRenewalDate = sim.nextRenewalDate && sim.nextRenewalDate <= now;
  
  // Check if expiration date (5 years) has passed
  const pastExpirationDate = sim.expirationDate && sim.expirationDate <= now;
  
  return usageAtMax || !!pastRenewalDate || !!pastExpirationDate;
};

// Get expiration reason for display
export const getExpirationReason = (sim: SimCard): string => {
  const dataPercentage = (sim.dataUsage / sim.dataPlan) * 100;
  const smsPercentage = (sim.smsCount / sim.smsPlan) * 100;
  const callPercentage = (sim.callDuration / sim.callPlan) * 100;
  
  const now = new Date();
  
  // Check expiration date first (5 years)
  if (sim.expirationDate && sim.expirationDate <= now) {
    return "Date d'expiration dépassée";
  }
  
  // Check renewal date
  if (sim.nextRenewalDate && sim.nextRenewalDate <= now) {
    return "Date de renouvellement dépassée";
  }
  
  // Check usage limits
  if (dataPercentage >= 100) return "Données épuisées";
  if (smsPercentage >= 100) return "SMS épuisés";
  if (callPercentage >= 100) return "Minutes d'appel épuisées";
  
  return "Crédits épuisés";
};

// Check if a SIM card needs recharge (usage > 80%)
export const needsRecharge = (sim: SimCard): boolean => {
  const dataPercentage = (sim.dataUsage / sim.dataPlan) * 100;
  const smsPercentage = (sim.smsCount / sim.smsPlan) * 100;
  const callPercentage = (sim.callDuration / sim.callPlan) * 100;
  
  return dataPercentage > 80 || smsPercentage > 80 || callPercentage > 80;
};

// Check and update expired status for SIM cards
export const checkAndUpdateExpiredStatus = (simCards: SimCard[]): SimCard[] => {
  return simCards.map(sim => {
    if (sim.status === "active" && isExpired(sim)) {
      return { ...sim, status: "expired" as const };
    }
    return sim;
  });
};

// Generate complete SIM card data
export const generateSimCardData = (): SimCard[] => {
  const simCards: SimCard[] = [];
  const simTypes: ("Truphone" | "Things Mobile" | "Phenix")[] = ["Truphone", "Things Mobile", "Phenix"];
  
  // Generate 5 SIM cards for each type
  simTypes.forEach(type => {
    for (let i = 1; i <= 5; i++) {
      const thresholds = getThresholds(type);
      const dataPlan = thresholds.data;
      const smsPlan = thresholds.sms;
      const callPlan = thresholds.calls;
      
      const dataUsagePercentage = generateUsagePercentage();
      const smsUsagePercentage = generateUsagePercentage();
      const callUsagePercentage = generateUsagePercentage();
      
      const activationDate = generateActivationDate();
      const expirationDate = generateExpirationDate(activationDate);
      const status = generateStatus();
      const lastActivity = generateLastActivity();
      
      simCards.push({
        id: generateSimId(type, i),
        type,
        dataPlan,
        dataUsage: Math.round(dataPlan * dataUsagePercentage),
        smsPlan,
        smsCount: Math.round(smsPlan * smsUsagePercentage),
        callPlan,
        callDuration: Math.round(callPlan * callUsagePercentage),
        status,
        lastActivity,
        activationDate,
        expirationDate,
        nextRenewalDate: generateNextRenewalDate(),
        rechargePending: status === "recharging",
        lastRechargeDate: status === "recharging" ? subDays(new Date(), Math.floor(Math.random() * 7)) : undefined
      });
    }
  });
  
  return simCards;
};
