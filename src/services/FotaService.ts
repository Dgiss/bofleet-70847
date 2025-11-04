
export interface Firmware {
  id: string;
  name: string;
  version: string;
  deviceModel: string;
  size: number;
  uploadDate: Date;
  description: string;
  status: "available" | "testing" | "deprecated";
}

export interface Device {
  id: string;
  imei: string;
  model: string;
  currentFirmware: string;
  lastUpdate: Date;
  status: "online" | "offline" | "updating";
}

export interface FotaDeployment {
  id: string;
  firmwareId: string;
  deviceIds: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
  progress: number;
}

export class FotaService {
  private static instance: FotaService;
  
  public static getInstance(): FotaService {
    if (!FotaService.instance) {
      FotaService.instance = new FotaService();
    }
    return FotaService.instance;
  }

  async getFirmwares(): Promise<Firmware[]> {
    console.log("Fetching available firmwares...");
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "fw_001",
            name: "FMB140 Standard",
            version: "03.28.07.Rev.00",
            deviceModel: "FMB140",
            size: 2048576,
            uploadDate: new Date("2024-01-15"),
            description: "Firmware standard pour FMB140 avec nouvelles fonctionnalités de géolocalisation",
            status: "available"
          },
          {
            id: "fw_002",
            name: "FMC130 Enhanced",
            version: "03.25.12.Rev.01",
            deviceModel: "FMC130",
            size: 1854720,
            uploadDate: new Date("2024-01-10"),
            description: "Version améliorée avec support Bluetooth 5.0",
            status: "available"
          }
        ]);
      }, 800);
    });
  }

  async uploadFirmware(file: File, metadata: Omit<Firmware, 'id' | 'uploadDate' | 'size'>): Promise<Firmware> {
    console.log("Uploading firmware:", file.name);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFirmware: Firmware = {
          id: `fw_${Date.now()}`,
          ...metadata,
          size: file.size,
          uploadDate: new Date()
        };
        resolve(newFirmware);
      }, 3000);
    });
  }

  async getDevices(): Promise<Device[]> {
    console.log("Fetching connected devices...");
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "dev_001",
            imei: "123456789012345",
            model: "FMB140",
            currentFirmware: "03.28.06.Rev.00",
            lastUpdate: new Date("2024-01-01"),
            status: "online"
          },
          {
            id: "dev_002",
            imei: "123456789012346",
            model: "FMC130",
            currentFirmware: "03.25.11.Rev.00",
            lastUpdate: new Date("2023-12-15"),
            status: "offline"
          }
        ]);
      }, 600);
    });
  }

  async deployFirmware(firmwareId: string, deviceIds: string[]): Promise<FotaDeployment> {
    console.log("Deploying firmware:", firmwareId, "to devices:", deviceIds);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const deployment: FotaDeployment = {
          id: `deploy_${Date.now()}`,
          firmwareId,
          deviceIds,
          status: "pending",
          createdAt: new Date(),
          progress: 0
        };
        resolve(deployment);
      }, 1000);
    });
  }

  async getDeployments(): Promise<FotaDeployment[]> {
    console.log("Fetching deployment history...");
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "deploy_001",
            firmwareId: "fw_001",
            deviceIds: ["dev_001"],
            status: "completed",
            createdAt: new Date("2024-01-20"),
            completedAt: new Date("2024-01-20"),
            progress: 100
          }
        ]);
      }, 500);
    });
  }
}
