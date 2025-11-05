import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EnhancedDataTable, Column } from "@/components/tables/EnhancedDataTable";
import { Loader2, RefreshCw, Search, AlertTriangle, CheckCircle2, XCircle, Zap, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { listThingsMobileSims } from "@/services/ThingsMobileService";
import { listPhenixSims } from "@/services/PhenixService";
import { useInfiniteTruphoneSims } from "@/hooks/useInfiniteTruphoneSims";
import { RechargeSimDialog } from "@/components/dialogs/RechargeSimDialog";

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
  const { toast } = useToast();
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([
    { provider: "Things Mobile", status: "loading", count: 0 },
    { provider: "Phenix", status: "loading", count: 0 },
    { provider: "Truphone", status: "loading", count: 0 },
  ]);

  // Hook pour le lazy loading Truphone
  const {
    sims: truphoneSims,
    loading: truphoneLoading,
    hasMore: truphoneHasMore,
    loadMore: loadMoreTruphone,
    reset: resetTruphone,
  } = useInfiniteTruphoneSims();

  const fetchAllSims = async (): Promise<UnifiedSim[]> => {
    const allSims: UnifiedSim[] = [];
    const newStatuses: ProviderStatus[] = [];

    // Things Mobile
    try {
      console.log("🔄 Chargement Things Mobile...");
      const tmResult = await listThingsMobileSims({ pageSize: 500 });
      tmResult.sims.forEach((sim) => {
        allSims.push({
          id: `tm-${sim.iccid || sim.msisdn}`,
          provider: "Things Mobile",
          msisdn: sim.msisdn || "—",
          iccid: sim.iccid || "—",
          status: sim.status || "unknown",
          name: sim.name,
          tag: sim.tag,
          dataUsage: formatBytes(sim.monthlyTrafficBytes),
          lastConnection: sim.lastConnectionDate,
        });
      });
      newStatuses.push({
        provider: "Things Mobile",
        status: "success",
        count: tmResult.sims.length,
      });
      console.log(`✅ Things Mobile: ${tmResult.sims.length} SIMs`);
    } catch (error: any) {
      console.error("❌ Things Mobile error:", error);
      newStatuses.push({
        provider: "Things Mobile",
        status: "error",
        count: 0,
        error: error.message,
      });
    }

    // Phenix
    try {
      console.log("🔄 Chargement Phenix...");
      const phenixSims = await listPhenixSims();
      phenixSims.forEach((sim) => {
        allSims.push({
          id: `phenix-${sim.iccid || sim.msisdn}`,
          provider: "Phenix",
          msisdn: sim.msisdn || "—",
          iccid: sim.iccid || "—",
          status: sim.status || "unknown",
        });
      });
      newStatuses.push({
        provider: "Phenix",
        status: "success",
        count: phenixSims.length,
      });
      console.log(`✅ Phenix: ${phenixSims.length} SIMs`);
    } catch (error: any) {
      console.error("❌ Phenix error:", error);
      newStatuses.push({
        provider: "Phenix",
        status: "error",
        count: 0,
        error: error.message,
      });
    }

    setProviderStatuses(newStatuses);
    console.log(`📊 Total (TM + Phenix): ${allSims.length} SIMs chargées`);
    return allSims;
  };

  const { data: otherProvidersSims = [], isLoading, error, refetch } = useQuery({
    queryKey: ["other-providers-sims"],
    queryFn: fetchAllSims,
    refetchInterval: 120000, // Rafraîchir toutes les 2 minutes
    retry: 1,
  });

  // Charger la première page de Truphone au montage
  useEffect(() => {
    loadMoreTruphone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Combiner toutes les SIMs (autres providers + Truphone lazy loaded)
  const truphoneUnifiedSims: UnifiedSim[] = truphoneSims.map((sim) => ({
    id: `truphone-${sim.iccid || sim.simId}`,
    provider: "Truphone",
    msisdn: sim.msisdn || "—",
    iccid: sim.iccid || "—",
    status: sim.status || "unknown",
  }));

  const allSims = [...otherProvidersSims, ...truphoneUnifiedSims];

  const filteredSims = allSims.filter((sim) => {
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return (
      sim.msisdn.toLowerCase().includes(search) ||
      sim.iccid.toLowerCase().includes(search) ||
      sim.provider.toLowerCase().includes(search)
    );
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
    { id: "dataUsage", label: "Data mensuelle", sortable: true },
    { id: "lastConnection", label: "Dernière connexion", sortable: true },
    { id: "name", label: "Nom", sortable: true },
    { id: "tag", label: "Tag", sortable: true },
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

  // Mettre à jour le statut Truphone
  useEffect(() => {
    if (truphoneSims.length > 0 && !truphoneLoading) {
      setProviderStatuses(prev => prev.map(p =>
        p.provider === "Truphone"
          ? { ...p, status: "success", count: truphoneSims.length }
          : p
      ));
    } else if (truphoneLoading && truphoneSims.length === 0) {
      setProviderStatuses(prev => prev.map(p =>
        p.provider === "Truphone"
          ? { ...p, status: "loading", count: 0 }
          : p
      ));
    }
  }, [truphoneSims.length, truphoneLoading]);

  const stats = {
    total: allSims.length,
    thingsMobile: allSims.filter((s) => s.provider === "Things Mobile").length,
    phenix: allSims.filter((s) => s.provider === "Phenix").length,
    truphone: truphoneSims.length,
  };

  return (
    <div className="space-y-6">
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
              onClick={() => {
                refetch();
                resetTruphone();
                setTimeout(() => loadMoreTruphone(), 100);
              }}
              variant="outline"
              disabled={isLoading || truphoneLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || truphoneLoading ? "animate-spin" : ""}`} />
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

          {/* Statistics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total SIMs</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Things Mobile</p>
                <p className="text-2xl font-semibold">{stats.thingsMobile}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Phenix</p>
                <p className="text-2xl font-semibold">{stats.phenix}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Truphone</p>
                <p className="text-2xl font-semibold">{stats.truphone}</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <div className="rounded-lg border bg-card">
            <EnhancedDataTable
              data={filteredSims}
              columns={columns}
              loading={isLoading || truphoneLoading}
              enablePagination={true}
            />
          </div>

          {/* Bouton Charger plus pour Truphone */}
          {truphoneHasMore && !searchValue && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => loadMoreTruphone()}
                disabled={truphoneLoading}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {truphoneLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Charger plus de SIMs Truphone ({truphoneSims.length} chargées)
                  </>
                )}
              </Button>
            </div>
          )}

          {!isLoading && !truphoneLoading && filteredSims.length === 0 && (
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
