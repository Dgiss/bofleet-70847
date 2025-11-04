
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Calendar, HardDrive } from "lucide-react";
import { Firmware, Device } from "@/services/FotaService";
import { formatDate } from "@/components/sim/sim-data-utils";

interface FirmwareListProps {
  firmwares: Firmware[];
  devices: Device[];
  onDeploy: (firmwareId: string, deviceIds: string[]) => void;
}

export function FirmwareList({ firmwares, devices, onDeploy }: FirmwareListProps) {
  const [selectedFirmware, setSelectedFirmware] = useState<string | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      available: "default",
      testing: "secondary",
      deprecated: "destructive"
    };
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getCompatibleDevices = (firmwareModel: string) => {
    return devices.filter(device => device.model === firmwareModel);
  };

  const handleDeploy = (firmwareId: string) => {
    const firmware = firmwares.find(f => f.id === firmwareId);
    if (!firmware) return;
    
    const compatibleDevices = getCompatibleDevices(firmware.deviceModel);
    const deviceIds = compatibleDevices.map(d => d.id);
    
    if (deviceIds.length === 0) {
      alert("Aucun équipement compatible trouvé");
      return;
    }
    
    onDeploy(firmwareId, deviceIds);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Modèle</TableHead>
            <TableHead>Taille</TableHead>
            <TableHead>Date d'upload</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Équipements compatibles</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firmwares.map((firmware) => {
            const compatibleDevices = getCompatibleDevices(firmware.deviceModel);
            
            return (
              <TableRow key={firmware.id}>
                <TableCell className="font-medium">{firmware.name}</TableCell>
                <TableCell>{firmware.version}</TableCell>
                <TableCell>{firmware.deviceModel}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-4 w-4" />
                    {formatSize(firmware.size)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(firmware.uploadDate)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(firmware.status)}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {compatibleDevices.length} équipement(s)
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleDeploy(firmware.id)}
                    disabled={firmware.status !== "available" || compatibleDevices.length === 0}
                    className="flex items-center gap-1"
                  >
                    <Upload className="h-4 w-4" />
                    Déployer
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {firmwares.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun firmware disponible
        </div>
      )}
    </div>
  );
}
