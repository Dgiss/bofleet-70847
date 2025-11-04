
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { FirmwareList } from "./FirmwareList";
import { FirmwareUpload } from "./FirmwareUpload";
import { DevicesList } from "./DevicesList";
import { DeploymentHistory } from "./DeploymentHistory";
import { FotaService, Firmware, Device, FotaDeployment } from "@/services/FotaService";

export default function FotaWebManagement() {
  const [firmwares, setFirmwares] = useState<Firmware[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deployments, setDeployments] = useState<FotaDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fotaService = FotaService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [firmwareData, deviceData, deploymentData] = await Promise.all([
        fotaService.getFirmwares(),
        fotaService.getDevices(),
        fotaService.getDeployments()
      ]);
      
      setFirmwares(firmwareData);
      setDevices(deviceData);
      setDeployments(deploymentData);
    } catch (error) {
      console.error("Error loading FOTA data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données FOTA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFirmwareUpload = async (file: File, metadata: any) => {
    try {
      const newFirmware = await fotaService.uploadFirmware(file, metadata);
      setFirmwares(prev => [...prev, newFirmware]);
      
      toast({
        title: "Firmware téléchargé",
        description: `Le firmware ${newFirmware.name} a été téléchargé avec succès`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible de télécharger le firmware",
        variant: "destructive",
      });
    }
  };

  const handleDeployment = async (firmwareId: string, deviceIds: string[]) => {
    try {
      const deployment = await fotaService.deployFirmware(firmwareId, deviceIds);
      setDeployments(prev => [...prev, deployment]);
      
      toast({
        title: "Déploiement initié",
        description: `Mise à jour lancée sur ${deviceIds.length} équipement(s)`,
      });
    } catch (error) {
      console.error("Deployment error:", error);
      toast({
        title: "Erreur de déploiement",
        description: "Impossible de lancer la mise à jour",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des données FOTA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion FOTA Teltonika</h1>
      
      <Tabs defaultValue="firmwares" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="firmwares">Firmwares</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="devices">Équipements</TabsTrigger>
          <TabsTrigger value="deployments">Déploiements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="firmwares">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Firmwares Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <FirmwareList 
                firmwares={firmwares}
                devices={devices}
                onDeploy={handleDeployment}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Télécharger un Nouveau Firmware</CardTitle>
            </CardHeader>
            <CardContent>
              <FirmwareUpload onUpload={handleFirmwareUpload} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Équipements Connectés</CardTitle>
            </CardHeader>
            <CardContent>
              <DevicesList devices={devices} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deployments">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Déploiements</CardTitle>
            </CardHeader>
            <CardContent>
              <DeploymentHistory deployments={deployments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
