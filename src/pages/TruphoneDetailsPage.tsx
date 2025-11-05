import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, Database } from "lucide-react";
import { SimDataAlert, type SimDataUsage } from "@/components/alerts/SimDataAlert";
import { listTruphoneSimsWithUsage, type TruphoneSimWithUsage } from "@/services/TruphoneService";
import { RechargeSimDialog } from "@/components/dialogs/RechargeSimDialog";
import { useToast } from "@/components/ui/use-toast";

type StatusFilter = "all" | "active" | "needs_recharge" | "critical";

export default function TruphoneDetailsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedSimForRecharge, setSelectedSimForRecharge] = useState<TruphoneSimWithUsage | null>(null);
  const { toast } = useToast();

  // Charger les SIMs Truphone avec leurs données de consommation
  const { data: sims = [], isLoading, error, refetch } = useQuery({
    queryKey: ["truphone-sims-with-usage"],
    queryFn: listTruphoneSimsWithUsage,
    refetchInterval: 120000, // Rafraîchir toutes les 2 minutes
    retry: 1,
  });

  // Filtrer les SIMs
  const filteredSims = sims.filter((sim) => {
    // Filtre de recherche
    if (searchValue) {
      const search = searchValue.toLowerCase();
      const matchesSearch =
        sim.iccid.toLowerCase().includes(search) ||
        sim.msisdn?.toLowerCase().includes(search) ||
        sim.label?.toLowerCase().includes(search) ||
        sim.servicePack?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Filtre de statut
    if (statusFilter === "active") {
      return sim.status === "ACTIVE";
    } else if (statusFilter === "needs_recharge") {
      return sim.needsRecharge && !sim.isCritical;
    } else if (statusFilter === "critical") {
      return sim.isCritical;
    }

    return true;
  });

  // Statistiques
  const stats = {
    total: sims.length,
    active: sims.filter((s) => s.status === "ACTIVE").length,
    needsRecharge: sims.filter((s) => s.needsRecharge && !s.isCritical).length,
    critical: sims.filter((s) => s.isCritical).length,
    totalDataUsed: sims.reduce((sum, s) => sum + (s.dataUsage || 0), 0),
    totalDataLimit: sims.reduce((sum, s) => sum + (s.dataLimit || 0), 0),
  };

  // Convertir les SIMs pour le composant d'alerte
  const simsForAlert: SimDataUsage[] = sims
    .filter((sim) => sim.needsRecharge || sim.isCritical)
    .map((sim) => ({
      iccid: sim.iccid,
      msisdn: sim.msisdn,
      provider: "Truphone" as const,
      dataUsed: sim.dataUsage || 0,
      dataLimit: sim.dataLimit,
      percentageUsed: sim.percentageUsed || 0,
      servicePack: sim.servicePack,
      label: sim.label,
    }));

  // Helper pour obtenir la couleur du badge de statut
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "destructive";
      case "SUSPENDED":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Helper pour obtenir la couleur de la barre de progression
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-600";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Détails Truphone</h1>
          <p className="text-muted-foreground mt-1">
            Vue détaillée des SIMs Truphone avec alertes de consommation
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Alertes */}
      {!isLoading && simsForAlert.length > 0 && (
        <SimDataAlert
          sims={simsForAlert}
          onRecharge={(iccid) => {
            const sim = sims.find((s) => s.iccid === iccid);
            if (sim) {
              setSelectedSimForRecharge(sim);
            }
          }}
        />
      )}

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SIMs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SIMs critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">
              ≥90% de consommation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SIMs à surveiller</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.needsRecharge}</div>
            <p className="text-xs text-muted-foreground">
              80-90% de consommation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consommation totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDataUsed.toFixed(1)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalDataLimit.toFixed(0)} MB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des SIMs</CardTitle>
          <CardDescription>
            {filteredSims.length} SIM(s) affichée(s) sur {sims.length} au total
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par ICCID, MSISDN, label, ou plan..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="needs_recharge">À surveiller</SelectItem>
                <SelectItem value="critical">Critiques</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loader */}
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Chargement des données...</span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-red-600">
                {error instanceof Error ? error.message : "Impossible de charger les données"}
              </p>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ICCID</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>MSISDN</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Plan tarifaire</TableHead>
                    <TableHead>Consommation données</TableHead>
                    <TableHead>SMS</TableHead>
                    <TableHead>Appels (min)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSims.length > 0 ? (
                    filteredSims.map((sim) => (
                      <TableRow
                        key={sim.iccid}
                        className={sim.isCritical ? "bg-red-50" : sim.needsRecharge ? "bg-orange-50" : ""}
                      >
                        <TableCell className="font-mono text-sm">{sim.iccid}</TableCell>
                        <TableCell>
                          {sim.label || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {sim.msisdn || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(sim.status)}>
                            {sim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sim.servicePack || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">
                                {sim.dataUsage?.toFixed(1) || 0} MB
                              </span>
                              <span className="text-muted-foreground">
                                / {sim.dataLimit || "?"} MB
                              </span>
                            </div>
                            {sim.dataLimit && (
                              <>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${getProgressColor(sim.percentageUsed || 0)}`}
                                    style={{ width: `${Math.min(sim.percentageUsed || 0, 100)}%` }}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {sim.percentageUsed?.toFixed(1)}%
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sim.smsCount || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sim.callDuration || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={sim.isCritical ? "destructive" : sim.needsRecharge ? "default" : "outline"}
                            onClick={() => setSelectedSimForRecharge(sim)}
                          >
                            Recharger
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                        Aucune SIM trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de recharge */}
      <RechargeSimDialog
        open={selectedSimForRecharge !== null}
        onOpenChange={(open) => !open && setSelectedSimForRecharge(null)}
        sim={
          selectedSimForRecharge
            ? {
                id: selectedSimForRecharge.iccid,
                provider: "Truphone",
                iccid: selectedSimForRecharge.iccid,
                msisdn: selectedSimForRecharge.msisdn || "—",
                status: selectedSimForRecharge.status,
                label: selectedSimForRecharge.label,
              }
            : null
        }
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
