import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, Zap } from "lucide-react";

export interface SimDataUsage {
  iccid: string;
  msisdn?: string;
  provider: "Truphone" | "Things Mobile" | "Phenix";
  dataUsed: number; // en MB
  dataLimit?: number; // en MB
  percentageUsed: number;
  servicePack?: string;
  label?: string;
}

export interface SimAlertConfig {
  warningThreshold: number; // % (par défaut 80%)
  criticalThreshold: number; // % (par défaut 90%)
}

const DEFAULT_CONFIG: SimAlertConfig = {
  warningThreshold: 80,
  criticalThreshold: 90,
};

interface SimDataAlertProps {
  sims: SimDataUsage[];
  config?: SimAlertConfig;
  onRecharge?: (iccid: string) => void;
}

/**
 * Composant d'alerte pour les SIMs qui approchent de leur limite de données
 *
 * Affiche :
 * - Alertes critiques (>90% de consommation) en rouge
 * - Alertes warning (>80% de consommation) en orange
 * - Informations générales en bleu
 */
export const SimDataAlert: React.FC<SimDataAlertProps> = ({
  sims,
  config = DEFAULT_CONFIG,
  onRecharge,
}) => {
  // Filtrer les SIMs qui nécessitent une alerte
  const criticalSims = sims.filter(
    (sim) => sim.percentageUsed >= config.criticalThreshold
  );
  const warningSims = sims.filter(
    (sim) =>
      sim.percentageUsed >= config.warningThreshold &&
      sim.percentageUsed < config.criticalThreshold
  );

  if (criticalSims.length === 0 && warningSims.length === 0) {
    return null; // Pas d'alertes à afficher
  }

  const renderSimItem = (sim: SimDataUsage) => (
    <div
      key={sim.iccid}
      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border"
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{sim.iccid}</span>
          {sim.label && (
            <Badge variant="outline" className="text-xs">
              {sim.label}
            </Badge>
          )}
          <Badge
            variant={
              sim.provider === "Truphone"
                ? "default"
                : sim.provider === "Things Mobile"
                  ? "secondary"
                  : "outline"
            }
            className="text-xs"
          >
            {sim.provider}
          </Badge>
        </div>
        {sim.msisdn && (
          <p className="text-xs text-muted-foreground">MSISDN: {sim.msisdn}</p>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">
            {sim.dataUsed.toFixed(1)} MB / {sim.dataLimit ? `${sim.dataLimit} MB` : "?"}
          </span>
          <span className="text-xs text-muted-foreground">
            ({sim.percentageUsed.toFixed(1)}%)
          </span>
        </div>
        {sim.servicePack && (
          <p className="text-xs text-muted-foreground">
            Plan: {sim.servicePack}
          </p>
        )}
        {/* Barre de progression */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              sim.percentageUsed >= config.criticalThreshold
                ? "bg-red-600"
                : "bg-orange-500"
            }`}
            style={{ width: `${Math.min(sim.percentageUsed, 100)}%` }}
          />
        </div>
      </div>
      {onRecharge && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRecharge(sim.iccid)}
          className="ml-4 gap-2"
        >
          <Zap className="h-4 w-4" />
          Recharger
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Alertes critiques (>90%) */}
      {criticalSims.length > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            ⚠️ {criticalSims.length} SIM(s) presque épuisée(s) (≥{config.criticalThreshold}%)
          </AlertTitle>
          <AlertDescription className="mt-3 space-y-2">
            <p className="text-sm mb-3">
              Les SIMs suivantes ont consommé plus de {config.criticalThreshold}% de leurs données.
              <strong> Une recharge est fortement recommandée.</strong>
            </p>
            {criticalSims.map(renderSimItem)}
          </AlertDescription>
        </Alert>
      )}

      {/* Alertes warning (80-90%) */}
      {warningSims.length > 0 && (
        <Alert className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-lg font-semibold text-orange-800 dark:text-orange-200">
            🔔 {warningSims.length} SIM(s) à surveiller (≥{config.warningThreshold}%)
          </AlertTitle>
          <AlertDescription className="mt-3 space-y-2">
            <p className="text-sm mb-3 text-orange-700 dark:text-orange-300">
              Les SIMs suivantes approchent de leur limite de données.
              <strong> Envisagez une recharge prochainement.</strong>
            </p>
            {warningSims.map(renderSimItem)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

/**
 * Version compacte du composant d'alerte (juste un compteur cliquable)
 */
interface SimDataAlertCompactProps {
  sims: SimDataUsage[];
  config?: SimAlertConfig;
  onClick?: () => void;
}

export const SimDataAlertCompact: React.FC<SimDataAlertCompactProps> = ({
  sims,
  config = DEFAULT_CONFIG,
  onClick,
}) => {
  const criticalCount = sims.filter(
    (sim) => sim.percentageUsed >= config.criticalThreshold
  ).length;
  const warningCount = sims.filter(
    (sim) =>
      sim.percentageUsed >= config.warningThreshold &&
      sim.percentageUsed < config.criticalThreshold
  ).length;

  if (criticalCount === 0 && warningCount === 0) {
    return null;
  }

  return (
    <Alert
      className={`cursor-pointer transition-colors ${
        criticalCount > 0
          ? "border-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100"
          : "border-orange-500 bg-orange-50 dark:bg-orange-950 hover:bg-orange-100"
      }`}
      onClick={onClick}
    >
      <AlertTriangle
        className={`h-5 w-5 ${
          criticalCount > 0 ? "text-red-600" : "text-orange-600"
        }`}
      />
      <AlertTitle className="text-base font-semibold">
        Alertes données
      </AlertTitle>
      <AlertDescription>
        <div className="flex items-center gap-4 mt-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {criticalCount} critique{criticalCount > 1 ? "s" : ""}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-orange-500 text-white text-sm">
              {warningCount} avertissement{warningCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Cliquez pour voir les détails
        </p>
      </AlertDescription>
    </Alert>
  );
};
