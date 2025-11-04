import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { SimCard, getThresholds, getSimTypeDisplayName, formatDate, getStatusDisplayName, needsRecharge, getExpirationReason } from "./sim-data-utils";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface SimCardTableProps {
  data: SimCard[];
  period: string;
  onStatusChange: (simId: string, newStatus: "active" | "suspended" | "blocked" | "recharging" | "expired") => void;
  onRecharge: (simId: string) => void;
  onCancelRecharge: (simId: string) => void;
}

export function SimCardTable({ data, period, onStatusChange, onRecharge, onCancelRecharge }: SimCardTableProps) {
  // Helper function to determine consumption color
  const getConsumptionColor = (percentage: number): string => {
    if (percentage >= 100) return "bg-red-600"; // Full consumption
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Helper function to determine status badge color
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "suspended": return "bg-yellow-100 text-yellow-800";
      case "blocked": return "bg-red-100 text-red-800";
      case "recharging": return "bg-blue-100 text-blue-800";
      case "expired": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get action buttons based on status and usage
  const getActionButtons = (sim: SimCard) => {
    const buttons = [];

    if (sim.status === "recharging") {
      buttons.push(
        <Button 
          key="cancel-recharge"
          variant="outline" 
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-50"
          onClick={() => onCancelRecharge(sim.id)}
        >
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Annuler
        </Button>
      );
    } else if (sim.status === "expired") {
      // Only show recharge button for expired cards
      buttons.push(
        <Button 
          key="recharge"
          variant="outline" 
          size="sm"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
          onClick={() => onRecharge(sim.id)}
        >
          Recharger
        </Button>
      );
    } else if (sim.status === "active") {
      if (needsRecharge(sim)) {
        buttons.push(
          <Button 
            key="recharge"
            variant="outline" 
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={() => onRecharge(sim.id)}
          >
            Recharger
          </Button>
        );
      }
      buttons.push(
        <Button 
          key="suspend"
          variant="outline" 
          size="sm"
          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
          onClick={() => onStatusChange(sim.id, "suspended")}
        >
          Suspendre
        </Button>
      );
    } else if (sim.status === "suspended" || sim.status === "blocked") {
      buttons.push(
        <Button 
          key="reactivate"
          variant="outline" 
          size="sm"
          className="text-green-600 border-green-600 hover:bg-green-50"
          onClick={() => onStatusChange(sim.id, "active")}
        >
          Réactiver
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">ID Carte SIM</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Forfait</TableHead>
            <TableHead className="min-w-[140px]">Données</TableHead>
            <TableHead className="min-w-[140px]">SMS</TableHead>
            <TableHead className="min-w-[140px]">Appels</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière activité</TableHead>
            <TableHead>Date d'expiration</TableHead>
            <TableHead className="w-48">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((sim) => {
              const thresholds = getThresholds(sim.type);
              const dataPercentage = (sim.dataUsage / sim.dataPlan) * 100;
              const smsPercentage = (sim.smsCount / sim.smsPlan) * 100;
              const callPercentage = (sim.callDuration / sim.callPlan) * 100;
              
              return (
                <TableRow key={sim.id} className={sim.status === "expired" ? "bg-red-50" : ""}>
                  <TableCell className="font-medium">{sim.id}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${sim.type === "Truphone" ? "bg-blue-100 text-blue-800" : 
                        sim.type === "Things Mobile" ? "bg-purple-100 text-purple-800" : 
                        "bg-indigo-100 text-indigo-800"}`
                    }>
                      {getSimTypeDisplayName(sim.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {sim.dataPlan} MB / {sim.smsPlan} SMS / {sim.callPlan} min
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm mb-1">
                      {sim.dataUsage} / {sim.dataPlan} MB
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getConsumptionColor(dataPercentage)}`}
                        style={{ width: `${Math.min(dataPercentage, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm mb-1">
                      {sim.smsCount} / {sim.smsPlan}
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getConsumptionColor(smsPercentage)}`}
                        style={{ width: `${Math.min(smsPercentage, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm mb-1">
                      {sim.callDuration} / {sim.callPlan} min
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getConsumptionColor(callPercentage)}`}
                        style={{ width: `${Math.min(callPercentage, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(sim.status)}`}>
                        {sim.status === "recharging" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {getStatusDisplayName(sim.status)}
                      </span>
                      {sim.status === "expired" && (
                        <div className="flex items-center text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {getExpirationReason(sim)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(sim.lastActivity)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {formatDate(sim.expirationDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Activée: {formatDate(sim.activationDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {getActionButtons(sim)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4 text-muted-foreground">
                Aucune donnée disponible
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
