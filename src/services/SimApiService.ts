
export interface SimProvider {
  id: string;
  name: string;
  apiUrl: string;
}

export interface SimCard {
  id: string;
  iccid: string;
  provider: "phenix" | "thingsmobile";
  status: "active" | "suspended" | "blocked" | "expired";
  plan: string;
  dataUsage: number;
  dataPlan: number;
  expirationDate: Date;
}

export interface SimSearchParams {
  iccid?: string;
  status?: string;
  provider?: "phenix" | "thingsmobile";
}

export interface PlanChangeRequest {
  simId: string;
  newPlan: string;
  provider: "phenix" | "thingsmobile";
}

export class SimApiService {
  private static instance: SimApiService;
  
  public static getInstance(): SimApiService {
    if (!SimApiService.instance) {
      SimApiService.instance = new SimApiService();
    }
    return SimApiService.instance;
  }

  // Service SIM Phenix (extranet-IT)
  async searchPhenixSims(params: SimSearchParams): Promise<SimCard[]> {
    console.log("Searching Phenix SIMs with params:", params);
    
    // Simulation d'appel API Phenix
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "phenix_001",
            iccid: "89331012345678901234",
            provider: "phenix",
            status: "active",
            plan: "IoT Standard",
            dataUsage: 150,
            dataPlan: 1000,
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        ]);
      }, 1000);
    });
  }

  async activatePhenixSim(iccid: string): Promise<boolean> {
    console.log("Activating Phenix SIM:", iccid);
    
    // Simulation d'activation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  }

  async changePhenixPlan(request: PlanChangeRequest): Promise<boolean> {
    console.log("Changing Phenix plan:", request);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  }

  // Service Things Mobile (plateforme IoT)
  async searchThingsMobileSims(params: SimSearchParams): Promise<SimCard[]> {
    console.log("Searching Things Mobile SIMs with params:", params);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "tm_001",
            iccid: "89882012345678901234",
            provider: "thingsmobile",
            status: "active",
            plan: "Global IoT",
            dataUsage: 75,
            dataPlan: 500,
            expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
          }
        ]);
      }, 1200);
    });
  }

  async activateThingsMobileSim(iccid: string): Promise<boolean> {
    console.log("Activating Things Mobile SIM:", iccid);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1800);
    });
  }

  async changeThingsMobilePlan(request: PlanChangeRequest): Promise<boolean> {
    console.log("Changing Things Mobile plan:", request);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1300);
    });
  }

  // Service unifié
  async searchAllSims(params: SimSearchParams): Promise<SimCard[]> {
    const [phenixSims, thingsMobileSims] = await Promise.all([
      this.searchPhenixSims(params),
      this.searchThingsMobileSims(params)
    ]);
    
    return [...phenixSims, ...thingsMobileSims];
  }

  async activateSim(iccid: string, provider: "phenix" | "thingsmobile"): Promise<boolean> {
    if (provider === "phenix") {
      return this.activatePhenixSim(iccid);
    } else {
      return this.activateThingsMobileSim(iccid);
    }
  }

  async changePlan(request: PlanChangeRequest): Promise<boolean> {
    if (request.provider === "phenix") {
      return this.changePhenixPlan(request);
    } else {
      return this.changeThingsMobilePlan(request);
    }
  }
}
