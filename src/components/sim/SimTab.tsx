import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnhancedDataTable, Column } from "@/components/tables/EnhancedDataTable";
import { Loader2, RefreshCw, Search, AlertTriangle } from "lucide-react";
import {
  getThingsMobileSimStatus,
  listThingsMobileSims,
  ThingsMobileSim,
} from "@/services/ThingsMobileService";
import { useToast } from "@/components/ui/use-toast";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actives" },
  { value: "to-activate", label: "À activer" },
  { value: "suspended", label: "Suspendues" },
  { value: "deactivated", label: "Désactivées" },
];

const formatBytesToMegabytes = (value?: number) => {
  if (value === undefined || value === null) {
    return null;
  }
  return value / 1_000_000;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const statusToBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "outline";
    case "suspended":
      return "secondary";
    case "to-activate":
      return "default";
    case "deactivated":
    case "not active":
    case "inactive":
      return "destructive";
    default:
      return "secondary";
  }
};

const deriveRowData = (sim: ThingsMobileSim) => {
  const balanceMb = formatBytesToMegabytes(sim.balanceBytes);
  const monthlyMb = formatBytesToMegabytes(sim.monthlyTrafficBytes);
  const dailyMb = formatBytesToMegabytes(sim.dailyTrafficBytes);

  return {
    id: sim.msisdn || sim.iccid,
    msisdn: sim.msisdn || "—",
    iccid: sim.iccid || "—",
    status: sim.status || "—",
    name: sim.name || "—",
    tag: sim.tag || "—",
    balanceMb,
    monthlyTrafficMb: monthlyMb,
    dailyTrafficMb: dailyMb,
    activationDate: sim.activationDate || "",
    expirationDate: sim.expirationDate || "",
    lastConnectionDate: sim.lastConnectionDate || "",
  };
};

const columns: Column[] = [
  { id: "msisdn", label: "MSISDN", sortable: true },
  { id: "iccid", label: "ICCID", sortable: true },
  {
    id: "status",
    label: "Statut",
    sortable: true,
    renderCell: (value: string) => (
      <Badge variant={statusToBadgeVariant(value)}>
        {value ? value.toUpperCase() : "—"}
      </Badge>
    ),
  },
  {
    id: "balanceMb",
    label: "Solde (MB)",
    sortable: true,
    renderCell: (value: number | null) => (value !== null ? `${value.toFixed(2)} MB` : "—"),
  },
  {
    id: "monthlyTrafficMb",
    label: "Data mensuelle (MB)",
    sortable: true,
    renderCell: (value: number | null) => (value !== null ? value.toFixed(2) : "—"),
  },
  {
    id: "dailyTrafficMb",
    label: "Data quotidienne (MB)",
    sortable: true,
    renderCell: (value: number | null) => (value !== null ? value.toFixed(2) : "—"),
  },
  {
    id: "lastConnectionDate",
    label: "Dernière connexion",
    sortable: true,
    renderCell: (value: string) => formatDate(value),
  },
  {
    id: "activationDate",
    label: "Activée le",
    sortable: true,
    renderCell: (value: string) => formatDate(value),
  },
  {
    id: "expirationDate",
    label: "Expiration",
    sortable: true,
    renderCell: (value: string) => formatDate(value),
  },
  { id: "name", label: "Nom", sortable: true },
  { id: "tag", label: "Tag", sortable: true },
];

const detectLookupField = (input: string): "msisdn" | "iccid" => {
  const trimmed = input.replace(/\s+/g, "");
  if (trimmed.length >= 18) {
    return "iccid";
  }
  return "msisdn";
};

export function SimTab() {
  const [sims, setSims] = useState<ThingsMobileSim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchValue, setSearchValue] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const mappedRows = useMemo(() => sims.map(deriveRowData), [sims]);
  const previewRows = useMemo(() => sims.slice(0, 50), [sims]);

  const summarizeStatuses = useMemo(() => {
    return sims.reduce(
      (acc, sim) => {
        const key = sim.status?.toLowerCase() || "other";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [sims]);

  const activeCount = summarizeStatuses["active"] || 0;
  const suspendedCount =
    summarizeStatuses["suspended"] +
      summarizeStatuses["suspend"] +
      summarizeStatuses["to-activate"] || 0;
  const inactiveCount =
    summarizeStatuses["deactivated"] +
      summarizeStatuses["not active"] +
      summarizeStatuses["inactive"] || 0;

  const loadSims = useCallback(
    async ({ reset = false, status }: { reset?: boolean; status?: string } = {}) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const effectiveStatus = status ?? statusFilter;
        const response = await listThingsMobileSims({
          page: reset ? 1 : page,
          pageSize: 100,
          status: effectiveStatus !== "all" ? effectiveStatus : undefined,
        });

        setSims((prev) => (reset ? response.sims : [...prev, ...response.sims]));
        setHasMore(response.hasMore);
        setPage((reset ? 1 : page) + 1);

        if (typeof status !== "undefined") {
          setStatusFilter(status);
        }
      } catch (apiError) {
        console.error("Things Mobile SIM list error:", apiError);
        const message =
          apiError instanceof Error ? apiError.message : "Impossible de récupérer les cartes SIM.";
        setError(message);
        toast({
          title: "Erreur lors du chargement des SIM",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, statusFilter, page, toast]
  );

  const handleRefresh = useCallback(() => {
    loadSims({ reset: true });
  }, [loadSims]);

  const handleStatusChange = useCallback(
    (value: string) => {
      loadSims({ reset: true, status: value });
    },
    [loadSims]
  );

  const handleSearch = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      if (!searchValue.trim()) {
        handleRefresh();
        return;
      }

      setLoading(true);
      setError(null);
      setHasMore(false);
      setStatusFilter("all");

      try {
        const field = detectLookupField(searchValue);
        const sim = await getThingsMobileSimStatus({
          [field]: searchValue.replace(/\s+/g, ""),
        });

        if (sim) {
          setSims([sim]);
          toast({
            title: "SIM trouvée",
            description: `La carte ${field.toUpperCase()} ${searchValue} a été récupérée.`,
          });
        } else {
          setSims([]);
          toast({
            title: "Aucune SIM trouvée",
            description: `Aucune carte ne correspond à ${searchValue}.`,
            variant: "destructive",
          });
        }
      } catch (lookupError) {
        console.error("Things Mobile SIM lookup error:", lookupError);
        const message =
          lookupError instanceof Error
            ? lookupError.message
            : "Impossible de récupérer les informations de cette SIM.";
        setError(message);
        toast({
          title: "Erreur de recherche",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [searchValue, toast, handleRefresh]
  );

  useEffect(() => {
    loadSims({ reset: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Cartes SIM Things Mobile</CardTitle>
          <p className="text-sm text-muted-foreground">
            Récupération en temps réel via l&apos;API Things Mobile. Les appels nécessitent un MSISDN ou un
            ICCID et respectent les limites de taux officielles.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch}>
            <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto,auto]">
              <Input
                placeholder="Rechercher par MSISDN ou ICCID"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
              <Button type="button" variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total cartes</p>
                <p className="text-2xl font-semibold">{sims.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Actives</p>
                <p className="text-2xl font-semibold">{activeCount}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">En attente / Suspendues</p>
                <p className="text-2xl font-semibold">{suspendedCount}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-rose-500">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Inactives / Désactivées</p>
                <p className="text-2xl font-semibold">{inactiveCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Aperçu rapide</CardTitle>
              <p className="text-sm text-muted-foreground">
                Affichage des {previewRows.length} premières cartes selon vos filtres.
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MSISDN</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Solde (MB)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {loading ? "Chargement des cartes SIM..." : "Aucune carte SIM à afficher."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      previewRows.map((sim) => {
                        const balance = formatBytesToMegabytes(sim.balanceBytes);
                        return (
                          <TableRow key={sim.msisdn || sim.iccid}>
                            <TableCell className="font-medium">{sim.msisdn || sim.iccid}</TableCell>
                            <TableCell>
                              <Badge variant={statusToBadgeVariant(sim.status)}>
                                {sim.status?.toUpperCase() || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {balance !== null ? `${balance.toFixed(2)} MB` : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border bg-card">
            <EnhancedDataTable
              data={mappedRows}
              columns={columns}
              loading={loading && sims.length === 0}
              enablePagination={false}
            />
            {loading && sims.length > 0 && (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mise à jour des données SIM...</span>
              </div>
            )}
            {!loading && sims.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                <AlertTriangle className="h-5 w-5" />
                <p>Aucune carte SIM correspondant à vos critères.</p>
              </div>
            )}
            {hasMore && (
              <div className="flex justify-center border-t bg-muted/50 p-4">
                <Button onClick={() => loadSims()} disabled={loading}>
                  Charger plus
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
