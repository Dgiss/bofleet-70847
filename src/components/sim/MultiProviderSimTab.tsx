import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EnhancedDataTable, Column } from "@/components/tables/EnhancedDataTable";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Zap } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { listAllThingsMobileSims } from "@/services/ThingsMobileService";
import { listPhenixSims } from "@/services/PhenixService";
import { listTruphoneSims, listTruphoneSimsPaged, enrichTruphoneSimsWithUsage, enrichTruphoneSimWithUsage, getAvailableTruphoneRatePlans } from "@/services/TruphoneService";
import { RechargeSimDialog } from "@/components/dialogs/RechargeSimDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnifiedSim {
  id: string;
  provider: "Things Mobile" | "Phenix" | "Truphone";
  msisdn: string;
  iccid: string;
  status: string;
  name?: string;
  tag?: string;
  dataUsage?: string;
  lastConnection?: string;
  label?: string;
  description?: string;
  imei?: string;
  servicePack?: string;
  simType?: string;
  organizationName?: string;
  // Données d'utilisation détaillées (Truphone)
  dataUsageBytes?: number;
  dataAllowanceBytes?: number;
  dataUsagePercent?: number;
  smsCount?: number;
  callDurationMinutes?: number;
  isLowData?: boolean; // true si l'utilisation dépasse le seuil d'alerte
  // Données de statut détaillé (Truphone)
  allowedData?: string;
  remainingData?: string;
  allowedTime?: string;
  remainingTime?: string;
  testStateStartDate?: string;
  _truphoneSimRef?: any; // Référence à la SIM Truphone originale pour enrichissement lazy
  _enriched?: boolean; // Marque si la SIM a été enrichie
}

interface ProviderStatus {
  provider: string;
  status: "loading" | "success" | "error";
  count: number;
  error?: string;
}

const statusToBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "activated":
      return "outline"; // Green outline for active SIMs
    case "suspended":
      return "secondary"; // Gray for suspended
    case "to-activate":
    case "test_ready":
    case "inventory":
      return "default"; // Blue for pending activation/test
    case "deactivated":
    case "not active":
    case "inactive":
    case "retired":
      return "destructive"; // Red for inactive
    case "unknown":
      return "secondary"; // Gray for unknown status
    default:
      return "secondary"; // Gray for any other status
  }
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "—";
  const mb = bytes / 1_000_000;
  return `${mb.toFixed(2)} MB`;
};

// Seuils d'alerte pour l'utilisation des données
const DATA_USAGE_THRESHOLDS = {
  WARNING: 70, // 70% = Avertissement (jaune)
  CRITICAL: 85, // 85% = Critique (orange)
  DEPLETED: 95, // 95% = Presque épuisé (rouge)
};

const getDataUsageBadgeVariant = (usagePercent?: number) => {
  if (!usagePercent) return "secondary";
  if (usagePercent >= DATA_USAGE_THRESHOLDS.DEPLETED) return "destructive"; // Rouge
  if (usagePercent >= DATA_USAGE_THRESHOLDS.CRITICAL) return "default"; // Orange/Bleu
  if (usagePercent >= DATA_USAGE_THRESHOLDS.WARNING) return "outline"; // Jaune
  return "secondary"; // Vert/Gris
};

const formatDataUsageWithPercent = (usageBytes?: number, allowanceBytes?: number, usagePercent?: number) => {
  if (!usageBytes) return "—";

  const usageMB = (usageBytes / 1_000_000).toFixed(2);

  if (allowanceBytes && usagePercent !== undefined) {
    const allowanceMB = (allowanceBytes / 1_000_000).toFixed(0);
    return `${usageMB} / ${allowanceMB} MB (${usagePercent.toFixed(1)}%)`;
  }

  return `${usageMB} MB`;
};

const statusToDisplayText = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
    case "activated":
      return "ACTIF";
    case "inactive":
    case "deactivated":
      return "INACTIF";
    case "suspended":
      return "SUSPENDU";
    case "to-activate":
      return "À ACTIVER";
    case "test_ready":
      return "TEST PRÊT";
    case "inventory":
      return "INVENTAIRE";
    case "retired":
      return "RETIRÉ";
    case "unknown":
      return "STATUT INCONNU";
    default:
      return status ? status.toUpperCase() : "—";
  }
};

export function MultiProviderSimTab() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSimForRecharge, setSelectedSimForRecharge] = useState<UnifiedSim | null>(null);
  // Filtres
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dataAlertFilter, setDataAlertFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([
    { provider: "Things Mobile", status: "loading", count: 0 },
    { provider: "Phenix", status: "loading", count: 0 },
    { provider: "Truphone", status: "loading", count: 0 },
  ]);
  const [enrichmentProgress, setEnrichmentProgress] = useState({ current: 0, total: 0 });
  const [isEnriching, setIsEnriching] = useState(false);
  const enrichmentDoneRef = useRef(false);
  const lastDataUpdateRef = useRef(0);

  // Charger les SIMs progressivement (un opérateur après l'autre)
  const [allSims, setAllSims] = useState<UnifiedSim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSimsProgressively = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAllSims([]); // Réinitialiser

    const newStatuses: ProviderStatus[] = [];
    console.log("🔄 Chargement progressif des opérateurs (un par un)...");
    const startTime = Date.now();

    try {
      // 1. Things Mobile EN PREMIER (le plus rapide généralement)
      try {
        console.log("📱 Chargement Things Mobile...");
        const tmSims = await listAllThingsMobileSims();
        const tmUnified = tmSims.map((sim) => ({
          id: `tm-${sim.iccid || sim.msisdn}`,
          provider: "Things Mobile" as const,
          msisdn: sim.msisdn || "—",
          iccid: sim.iccid || "—",
          status: sim.status || "unknown",
          name: sim.name,
          tag: sim.tag,
          dataUsage: formatBytes(sim.monthlyTrafficBytes),
          lastConnection: sim.lastConnectionDate,
        }));

        setAllSims(prev => [...prev, ...tmUnified]); // Afficher immédiatement
        newStatuses.push({
          provider: "Things Mobile",
          status: "success",
          count: tmUnified.length,
        });
        console.log(`✅ Things Mobile: ${tmUnified.length} SIMs affichées`);
      } catch (err: any) {
        console.error("❌ Things Mobile error:", err);
        newStatuses.push({
          provider: "Things Mobile",
          status: "error",
          count: 0,
          error: err.message,
        });
      }

      // 2. Phenix EN DEUXIÈME
      try {
        console.log("📱 Chargement Phenix...");
        const phenixSims = await listPhenixSims();
        const phenixUnified = phenixSims.map((sim) => ({
          id: `phenix-${sim.iccid || sim.msisdn}`,
          provider: "Phenix" as const,
          msisdn: sim.msisdn || "—",
          iccid: sim.iccid || "—",
          status: sim.status || "unknown",
        }));

        setAllSims(prev => [...prev, ...phenixUnified]); // Afficher immédiatement
        newStatuses.push({
          provider: "Phenix",
          status: "success",
          count: phenixUnified.length,
        });
        console.log(`✅ Phenix: ${phenixUnified.length} SIMs affichées`);
      } catch (err: any) {
        console.error("❌ Phenix error:", err);
        newStatuses.push({
          provider: "Phenix",
          status: "error",
          count: 0,
          error: err.message,
        });
      }

      // 3. Truphone EN DERNIER (le plus lent) - CHARGEMENT PAGE PAR PAGE
      try {
        console.log("📱 Chargement Truphone page par page...");
        let truphonePage = 1;
        let hasMoreTruphone = true;
        let totalTruphone = 0;

        while (hasMoreTruphone) {
          const pageResult = await listTruphoneSimsPaged(truphonePage, 500);

          if (pageResult.sims.length > 0) {
            const truphoneUnified = pageResult.sims.map((sim) => ({
              id: `truphone-${sim.iccid || sim.simId}`,
              provider: "Truphone" as const,
              msisdn: sim.msisdn || "—",
              iccid: sim.iccid || "—",
              status: sim.status || "unknown",
              label: sim.label,
              description: sim.description,
              imei: sim.imei,
              servicePack: sim.servicePack,
              simType: sim.simType,
              organizationName: sim.organizationName,
              dataUsageBytes: undefined,
              dataAllowanceBytes: undefined,
              dataUsagePercent: undefined,
              smsCount: undefined,
              callDurationMinutes: undefined,
              isLowData: false,
              _truphoneSimRef: sim,
            }));

            setAllSims(prev => [...prev, ...truphoneUnified]); // Afficher IMMÉDIATEMENT chaque page
            totalTruphone += truphoneUnified.length;
            console.log(`✅ Truphone page ${truphonePage}: ${truphoneUnified.length} SIMs affichées (total: ${totalTruphone})`);
          }

          hasMoreTruphone = pageResult.hasMore;
          truphonePage++;

          // Protection contre boucle infinie
          if (truphonePage > 50) {
            console.warn("⚠️ Truphone: Limite de 50 pages atteinte");
            break;
          }
        }

        newStatuses.push({
          provider: "Truphone",
          status: "success",
          count: totalTruphone,
        });
        console.log(`✅ Truphone: ${totalTruphone} SIMs au total (enrichissement progressif à venir)`);
      } catch (err: any) {
        console.error("❌ Truphone error:", err);
        newStatuses.push({
          provider: "Truphone",
          status: "error",
          count: 0,
          error: err.message,
        });
      }

      const duration = Date.now() - startTime;
      setProviderStatuses(newStatuses);
      console.log(`📊 Total: ${allSims.length} SIMs chargées en ${duration}ms`);
    } catch (err: any) {
      console.error("❌ Erreur générale:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    loadSimsProgressively();
  }, []);

  const refetch = () => {
    loadSimsProgressively();
  };

  const dataUpdatedAt = Date.now(); // Simuler pour compatibilité

  // Enrichissement progressif des SIMs Truphone en arrière-plan
  useEffect(() => {
    // Vérifier si les données ont changé (nouveau chargement)
    if (dataUpdatedAt !== lastDataUpdateRef.current) {
      lastDataUpdateRef.current = dataUpdatedAt;
      enrichmentDoneRef.current = false; // Réinitialiser pour le nouveau chargement
    }

    const enrichTruphoneSims = async () => {
      // Ne pas enrichir si on est déjà en train d'enrichir, si on est en chargement, ou si c'est déjà fait
      if (isEnriching || isLoading || allSims.length === 0 || enrichmentDoneRef.current) return;

      // Trouver les SIMs Truphone non enrichies
      const truphoneSims = allSims.filter(
        sim => sim.provider === "Truphone" && !sim._enriched && sim._truphoneSimRef
      );

      if (truphoneSims.length === 0) {
        enrichmentDoneRef.current = true;
        return;
      }

      setIsEnriching(true);
      setEnrichmentProgress({ current: 0, total: truphoneSims.length });
      console.log(`🔄 Démarrage de l'enrichissement progressif: ${truphoneSims.length} SIMs Truphone`);

      try {
        // Charger les rate plans une seule fois
        const ratePlans = await getAvailableTruphoneRatePlans();
        console.log(`📋 ${ratePlans.length} rate plan(s) disponibles pour l'enrichissement`);

        // Enrichir par batch de 5 SIMs pour ne pas surcharger l'API
        const BATCH_SIZE = 5;
        let enrichedCount = 0;

        for (let i = 0; i < truphoneSims.length; i += BATCH_SIZE) {
          const batch = truphoneSims.slice(i, i + BATCH_SIZE);

          // Enrichir le batch en parallèle
          const enrichPromises = batch.map(async (unifiedSim) => {
            const sim = unifiedSim._truphoneSimRef;
            const ratePlan = ratePlans?.find(plan => plan.id === sim.servicePack);
            const dataAllowanceMB = ratePlan?.dataAllowance;

            try {
              const enrichedSim = await enrichTruphoneSimWithUsage(sim, dataAllowanceMB);

              // Mettre à jour la SIM dans le cache React Query
              queryClient.setQueryData(["all-sims"], (oldData: UnifiedSim[] | undefined) => {
                if (!oldData) return oldData;

                return oldData.map(s =>
                  s.id === unifiedSim.id
                    ? {
                        ...s,
                        dataUsageBytes: enrichedSim.dataUsageBytes,
                        dataAllowanceBytes: enrichedSim.dataAllowanceBytes,
                        dataUsagePercent: enrichedSim.dataUsagePercent,
                        smsCount: enrichedSim.smsCount,
                        callDurationMinutes: enrichedSim.callDurationMinutes,
                        allowedData: enrichedSim.allowedData,
                        remainingData: enrichedSim.remainingData,
                        allowedTime: enrichedSim.allowedTime,
                        remainingTime: enrichedSim.remainingTime,
                        testStateStartDate: enrichedSim.testStateStartDate,
                        isLowData: enrichedSim.dataUsagePercent !== undefined &&
                                   enrichedSim.dataUsagePercent >= DATA_USAGE_THRESHOLDS.WARNING,
                        _enriched: true,
                      }
                    : s
                );
              });

              return true;
            } catch (error) {
              console.error(`Erreur enrichissement ${sim.iccid}:`, error);
              return false;
            }
          });

          await Promise.allSettled(enrichPromises);
          enrichedCount += batch.length;
          setEnrichmentProgress({ current: enrichedCount, total: truphoneSims.length });

          // Petite pause entre les batchs pour éviter de surcharger l'API
          if (i + BATCH_SIZE < truphoneSims.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        console.log(`✅ Enrichissement terminé: ${enrichedCount}/${truphoneSims.length} SIMs`);
        enrichmentDoneRef.current = true;
      } catch (error) {
        console.error("Erreur lors de l'enrichissement progressif:", error);
        enrichmentDoneRef.current = true; // Marquer comme fait même en cas d'erreur
      } finally {
        setIsEnriching(false);
      }
    };

    // Démarrer l'enrichissement après un court délai pour laisser l'UI se charger
    const timer = setTimeout(() => {
      enrichTruphoneSims();
    }, 1000);

    return () => clearTimeout(timer);
  }, [dataUpdatedAt, isLoading]); // allSims et isEnriching exclus volontairement pour éviter les boucles

  const filteredSims = allSims.filter((sim) => {
    // Filtre de recherche texte
    if (searchValue) {
      const search = searchValue.toLowerCase();
      const matchesSearch =
        sim.msisdn.toLowerCase().includes(search) ||
        sim.iccid.toLowerCase().includes(search) ||
        sim.provider.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Filtre opérateur
    if (providerFilter !== "all" && sim.provider !== providerFilter) {
      return false;
    }

    // Filtre statut
    if (statusFilter !== "all") {
      const normalizedStatus = sim.status?.toLowerCase();
      if (statusFilter === "active" && normalizedStatus !== "active" && normalizedStatus !== "activated") {
        return false;
      }
      if (statusFilter === "inactive" && normalizedStatus !== "inactive" && normalizedStatus !== "deactivated" && normalizedStatus !== "not active") {
        return false;
      }
      if (statusFilter === "suspended" && normalizedStatus !== "suspended") {
        return false;
      }
      if (statusFilter === "other" &&
          normalizedStatus !== "active" && normalizedStatus !== "activated" &&
          normalizedStatus !== "inactive" && normalizedStatus !== "deactivated" && normalizedStatus !== "not active" &&
          normalizedStatus !== "suspended") {
        // Afficher les autres statuts
      } else if (statusFilter === "other") {
        return false;
      }
    }

    // Filtre niveau d'alerte données
    if (dataAlertFilter !== "all") {
      const usagePercent = sim.dataUsagePercent;

      if (dataAlertFilter === "ok" && (usagePercent === undefined || usagePercent >= DATA_USAGE_THRESHOLDS.WARNING)) {
        return false;
      }
      if (dataAlertFilter === "warning" && (usagePercent === undefined || usagePercent < DATA_USAGE_THRESHOLDS.WARNING || usagePercent >= DATA_USAGE_THRESHOLDS.CRITICAL)) {
        return false;
      }
      if (dataAlertFilter === "critical" && (usagePercent === undefined || usagePercent < DATA_USAGE_THRESHOLDS.CRITICAL || usagePercent >= DATA_USAGE_THRESHOLDS.DEPLETED)) {
        return false;
      }
      if (dataAlertFilter === "depleted" && (usagePercent === undefined || usagePercent < DATA_USAGE_THRESHOLDS.DEPLETED)) {
        return false;
      }
    }

    return true;
  });

  const columns: Column[] = [
    {
      id: "provider",
      label: "Opérateur",
      sortable: true,
      renderCell: (value: string) => (
        <Badge variant={
          value === "Things Mobile" ? "default" :
          value === "Phenix" ? "secondary" :
          "outline"
        }>
          {value}
        </Badge>
      ),
    },
    { id: "msisdn", label: "MSISDN", sortable: true },
    { id: "iccid", label: "ICCID", sortable: true },
    {
      id: "status",
      label: "Statut",
      sortable: true,
      renderCell: (value: string) => (
        <Badge variant={statusToBadgeVariant(value)}>
          {statusToDisplayText(value)}
        </Badge>
      ),
    },
    {
      id: "dataUsage",
      label: "Data mensuelle (Things Mobile)",
      sortable: true,
      renderCell: (value: string, row: any) => {
        // Pour Things Mobile, afficher la data mensuelle simple
        if (row.provider === "Things Mobile") {
          return value || "—";
        }
        return "—";
      }
    },
    {
      id: "dataUsageDetailed",
      label: "Utilisation data (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        // Pour Truphone, afficher l'utilisation détaillée avec pourcentage
        if (row.provider === "Truphone" && row.dataUsageBytes) {
          const formatted = formatDataUsageWithPercent(
            row.dataUsageBytes,
            row.dataAllowanceBytes,
            row.dataUsagePercent
          );

          // Ajouter un badge coloré si on a un pourcentage
          if (row.dataUsagePercent !== undefined) {
            return (
              <div className="flex items-center gap-2">
                <span>{formatted}</span>
                <Badge variant={getDataUsageBadgeVariant(row.dataUsagePercent)}>
                  {row.dataUsagePercent >= DATA_USAGE_THRESHOLDS.DEPLETED ? "🚨 Critique" :
                   row.dataUsagePercent >= DATA_USAGE_THRESHOLDS.CRITICAL ? "⚠️ Élevé" :
                   row.dataUsagePercent >= DATA_USAGE_THRESHOLDS.WARNING ? "⚡ Attention" :
                   "✅ OK"}
                </Badge>
              </div>
            );
          }
          return formatted;
        }
        return "—";
      }
    },
    {
      id: "smsCount",
      label: "SMS (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.smsCount !== undefined) {
          return row.smsCount.toString();
        }
        return "—";
      }
    },
    {
      id: "callDurationMinutes",
      label: "Appels (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.callDurationMinutes !== undefined) {
          return `${row.callDurationMinutes} min`;
        }
        return "—";
      }
    },
    {
      id: "allowedData",
      label: "Données autorisées (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.allowedData) {
          return row.allowedData;
        }
        return "—";
      }
    },
    {
      id: "remainingData",
      label: "Données restantes (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.remainingData) {
          return row.remainingData;
        }
        return "—";
      }
    },
    {
      id: "allowedTime",
      label: "Temps autorisé (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.allowedTime) {
          return row.allowedTime;
        }
        return "—";
      }
    },
    {
      id: "remainingTime",
      label: "Temps restant (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.remainingTime) {
          return row.remainingTime;
        }
        return "—";
      }
    },
    {
      id: "testStateStartDate",
      label: "Date test (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.testStateStartDate) {
          return row.testStateStartDate;
        }
        return "—";
      }
    },
    { id: "lastConnection", label: "Dernière connexion", sortable: true },
    { id: "name", label: "Nom", sortable: true },
    { id: "tag", label: "Tag", sortable: true },
    { id: "label", label: "Libellé", sortable: true },
    { id: "imei", label: "IMEI", sortable: true },
    { id: "servicePack", label: "Plan tarifaire", sortable: true },
    { id: "organizationName", label: "Organisation", sortable: true },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      renderCell: (value: any, row: any) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedSimForRecharge(row)}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          Recharger
        </Button>
      ),
    },
  ];

  const stats = {
    total: allSims.length,
    thingsMobile: allSims.filter((s) => s.provider === "Things Mobile").length,
    phenix: allSims.filter((s) => s.provider === "Phenix").length,
    truphone: allSims.filter((s) => s.provider === "Truphone").length,
  };

  // Calculer les SIMs avec un niveau de data faible
  const lowDataSims = allSims.filter(sim => sim.isLowData && sim.dataUsagePercent !== undefined);
  const criticalSims = lowDataSims.filter(sim => sim.dataUsagePercent! >= DATA_USAGE_THRESHOLDS.DEPLETED);
  const warningSims = lowDataSims.filter(sim =>
    sim.dataUsagePercent! >= DATA_USAGE_THRESHOLDS.WARNING &&
    sim.dataUsagePercent! < DATA_USAGE_THRESHOLDS.DEPLETED
  );

  return (
    <div className="space-y-6">
      {/* Barre de progression de l'enrichissement */}
      {isEnriching && enrichmentProgress.total > 0 && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <AlertTitle>Enrichissement des données Truphone en cours...</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm">
                Chargement des données d'utilisation: {enrichmentProgress.current} / {enrichmentProgress.total} SIMs
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(enrichmentProgress.current / enrichmentProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Les SIMs de base sont déjà affichées. Les données d'utilisation sont chargées progressivement en arrière-plan.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerte pour SIMs presque épuisées */}
      {lowDataSims.length > 0 && (
        <Alert
          variant={criticalSims.length > 0 ? "destructive" : "default"}
          className={criticalSims.length === 0 ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950" : ""}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {criticalSims.length > 0 ? "⚠️ SIMs en situation critique" : "💡 Reminder: SIMs nécessitant une attention"}
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {criticalSims.length > 0 && (
                <div>
                  <strong className="text-red-600 dark:text-red-400">
                    🚨 {criticalSims.length} SIM(s) presque épuisée(s) (≥ {DATA_USAGE_THRESHOLDS.DEPLETED}%)
                  </strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {criticalSims.slice(0, 5).map(sim => (
                      <li key={sim.id} className="text-sm">
                        <strong>{sim.iccid}</strong> - {sim.dataUsagePercent?.toFixed(1)}% utilisé
                        {sim.servicePack && ` (${sim.servicePack})`}
                      </li>
                    ))}
                    {criticalSims.length > 5 && (
                      <li className="text-sm italic">... et {criticalSims.length - 5} autre(s)</li>
                    )}
                  </ul>
                </div>
              )}
              {warningSims.length > 0 && (
                <div className={criticalSims.length > 0 ? "mt-3" : ""}>
                  <strong className={criticalSims.length > 0 ? "text-yellow-600 dark:text-yellow-400" : ""}>
                    ⚡ {warningSims.length} SIM(s) approchant la limite (≥ {DATA_USAGE_THRESHOLDS.WARNING}%)
                  </strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {warningSims.slice(0, 3).map(sim => (
                      <li key={sim.id} className="text-sm">
                        <strong>{sim.iccid}</strong> - {sim.dataUsagePercent?.toFixed(1)}% utilisé
                        {sim.servicePack && ` (${sim.servicePack})`}
                      </li>
                    ))}
                    {warningSims.length > 3 && (
                      <li className="text-sm italic">... et {warningSims.length - 3} autre(s)</li>
                    )}
                  </ul>
                </div>
              )}
              <p className="text-sm mt-2 italic">
                💡 Conseil: Rechargez ces SIMs avant qu'elles n'atteignent 100% pour éviter les interruptions de service.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Toutes les Cartes SIM (3 Opérateurs)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Vue unifiée des SIMs de Things Mobile, Phenix et Truphone
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Status Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {providerStatuses.map((providerStatus) => (
              <Card key={providerStatus.provider} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{providerStatus.provider}</p>
                    {providerStatus.status === "loading" && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {providerStatus.status === "success" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {providerStatus.status === "error" && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {providerStatus.status === "success" ? providerStatus.count : "—"}
                  </p>
                  {providerStatus.status === "error" && (
                    <p className="text-xs text-red-500 mt-1">{providerStatus.error}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par MSISDN, ICCID ou opérateur..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "Impossible de récupérer les SIMs"}
              </AlertDescription>
            </Alert>
          )}

          {/* Warning for partial data */}
          {providerStatuses.some((p) => p.status === "error") && !isLoading && (
            <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Données partielles</AlertTitle>
              <AlertDescription>
                Certains opérateurs n'ont pas pu être chargés. Les données affichées sont incomplètes.
                <br />
                {providerStatuses
                  .filter((p) => p.status === "error")
                  .map((p) => `❌ ${p.provider}: ${p.error}`)
                  .join(" • ")}
              </AlertDescription>
            </Alert>
          )}

          {/* Filtres */}
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Opérateur</label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les opérateurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les opérateurs</SelectItem>
                  <SelectItem value="Things Mobile">Things Mobile</SelectItem>
                  <SelectItem value="Phenix">Phenix</SelectItem>
                  <SelectItem value="Truphone">Truphone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Niveau d'alerte</label>
              <Select value={dataAlertFilter} onValueChange={setDataAlertFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="ok">✅ OK (&lt;{DATA_USAGE_THRESHOLDS.WARNING}%)</SelectItem>
                  <SelectItem value="warning">⚡ Attention ({DATA_USAGE_THRESHOLDS.WARNING}-{DATA_USAGE_THRESHOLDS.CRITICAL}%)</SelectItem>
                  <SelectItem value="critical">⚠️ Critique ({DATA_USAGE_THRESHOLDS.CRITICAL}-{DATA_USAGE_THRESHOLDS.DEPLETED}%)</SelectItem>
                  <SelectItem value="depleted">🚨 Épuisé (≥{DATA_USAGE_THRESHOLDS.DEPLETED}%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setProviderFilter("all");
                  setStatusFilter("all");
                  setDataAlertFilter("all");
                  setSearchValue("");
                }}
                className="w-full"
              >
                Réinitialiser filtres
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-lg border bg-card">
            <EnhancedDataTable
              data={filteredSims}
              columns={columns}
              loading={isLoading}
              enablePagination={true}
            />
          </div>

          {!isLoading && filteredSims.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <AlertTriangle className="h-5 w-5" />
              <p>Aucune carte SIM trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de recharge */}
      <RechargeSimDialog
        open={selectedSimForRecharge !== null}
        onOpenChange={(open) => !open && setSelectedSimForRecharge(null)}
        sim={selectedSimForRecharge}
        onSuccess={() => {
          refetch();
          toast({
            title: "Recharge terminée",
            description: "La SIM a été rechargée avec succès",
          });
        }}
      />
    </div>
  );
}
