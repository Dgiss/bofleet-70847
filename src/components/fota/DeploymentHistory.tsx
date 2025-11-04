
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users } from "lucide-react";
import { FotaDeployment } from "@/services/FotaService";
import { formatDate } from "@/components/sim/sim-data-utils";

interface DeploymentHistoryProps {
  deployments: FotaDeployment[];
}

export function DeploymentHistory({ deployments }: DeploymentHistoryProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      in_progress: "default",
      completed: "default",
      failed: "destructive"
    };
    
    const labels: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours",
      completed: "Terminé",
      failed: "Échec"
    };
    
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Déploiement</TableHead>
            <TableHead>Firmware</TableHead>
            <TableHead>Équipements</TableHead>
            <TableHead>Progression</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de Création</TableHead>
            <TableHead>Date de Fin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((deployment) => (
            <TableRow key={deployment.id}>
              <TableCell className="font-mono text-sm">{deployment.id}</TableCell>
              <TableCell className="font-mono text-sm">{deployment.firmwareId}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {deployment.deviceIds.length} équipement(s)
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Progress value={deployment.progress} className="w-20" />
                  <span className="text-sm text-muted-foreground">{deployment.progress}%</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(deployment.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(deployment.createdAt)}
                </div>
              </TableCell>
              <TableCell>
                {deployment.completedAt ? (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(deployment.completedAt)}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {deployments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun déploiement dans l'historique
        </div>
      )}
    </div>
  );
}
