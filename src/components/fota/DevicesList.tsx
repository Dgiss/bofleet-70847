
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Calendar, Wifi, WifiOff } from "lucide-react";
import { Device } from "@/services/FotaService";
import { formatDate } from "@/components/sim/sim-data-utils";

interface DevicesListProps {
  devices: Device[];
}

export function DevicesList({ devices }: DevicesListProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      online: "default",
      offline: "secondary",
      updating: "destructive"
    };
    
    const labels: Record<string, string> = {
      online: "En ligne",
      offline: "Hors ligne",
      updating: "Mise à jour"
    };
    
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "offline":
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      case "updating":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>IMEI</TableHead>
            <TableHead>Modèle</TableHead>
            <TableHead>Firmware Actuel</TableHead>
            <TableHead>Dernière Mise à Jour</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-mono">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  {device.imei}
                </div>
              </TableCell>
              <TableCell className="font-medium">{device.model}</TableCell>
              <TableCell className="font-mono text-sm">{device.currentFirmware}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(device.lastUpdate)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(device.status)}
                  {getStatusBadge(device.status)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {devices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun équipement connecté
        </div>
      )}
    </div>
  );
}
