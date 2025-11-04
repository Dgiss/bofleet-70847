import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Loader2, Car, Filter } from "lucide-react";
import { getLazyClient, waitForAmplifyConfig, withCredentialRetry } from '@/config/aws-config.js';
import * as queries from '@/graphql/queries';
import * as mutations from '@/graphql/mutations';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyableCell } from "@/components/tables/CopyableCell";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const client = getLazyClient();

interface CompanyVehiclesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
}

export function CompanyVehiclesDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
}: CompanyVehiclesDialogProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [syncingSIV, setSyncingSIV] = useState(false);
  const [syncingANTAI, setSyncingANTAI] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [sivFilter, setSivFilter] = useState<"all" | "activated" | "not_activated">("all");

  useEffect(() => {
    if (open && companyId) {
      fetchVehicles();
      setSelectedVehicles(new Set());
      setFilterText("");
      setSivFilter("all");
    }
  }, [open, companyId]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      await waitForAmplifyConfig();
      
      let allVehicles: any[] = [];
      let nextToken = null;

      await withCredentialRetry(async () => {
        do {
          const result: any = await client.graphql({
            query: queries.vehiclesByCompanyVehiclesId,
            variables: {
              companyVehiclesId: companyId,
              limit: 100,
              nextToken: nextToken,
            },
          });

          const items = result.data?.vehiclesByCompanyVehiclesId?.items || [];
          allVehicles = [...allVehicles, ...items];
          nextToken = result.data?.vehiclesByCompanyVehiclesId?.nextToken;
        } while (nextToken);
      });

      setVehicles(allVehicles);
    } catch (error) {
      console.error("Erreur lors du chargement des véhicules:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const isSivActivated = (vehicle: any) => {
    // SIV activé si au moins un champ AWN_ est rempli
    return !!(
      vehicle.AWN_nom_commercial ||
      vehicle.AWN_marque ||
      vehicle.AWN_model ||
      vehicle.AWN_VIN ||
      vehicle.AWN_k_type
    );
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Filtre par texte
      const searchText = filterText.toLowerCase();
      const matchesText = !searchText || 
        vehicle.immat?.toLowerCase().includes(searchText) ||
        vehicle.marque?.toLowerCase().includes(searchText) ||
        vehicle.modele?.modele?.toLowerCase().includes(searchText) ||
        vehicle.AWN_nom_commercial?.toLowerCase().includes(searchText);

      // Filtre par statut SIV
      const sivStatus = isSivActivated(vehicle);
      const matchesSiv = sivFilter === "all" ||
        (sivFilter === "activated" && sivStatus) ||
        (sivFilter === "not_activated" && !sivStatus);

      return matchesText && matchesSiv;
    });
  }, [vehicles, filterText, sivFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVehicles(new Set(filteredVehicles.map(v => v.immat)));
    } else {
      setSelectedVehicles(new Set());
    }
  };

  const handleSelectVehicle = (immat: string, checked: boolean) => {
    const newSelected = new Set(selectedVehicles);
    if (checked) {
      newSelected.add(immat);
    } else {
      newSelected.delete(immat);
    }
    setSelectedVehicles(newSelected);
  };

  const handleSyncSIV = async () => {
    if (selectedVehicles.size === 0) {
      toast({
        variant: "destructive",
        description: "Veuillez sélectionner au moins un véhicule",
      });
      return;
    }

    setSyncingSIV(true);
    try {
      // Simulation de l'appel API SIV
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        description: `Synchronisation SIV lancée pour ${selectedVehicles.size} véhicule(s)`,
      });
      
      setSelectedVehicles(new Set());
    } catch (error) {
      console.error("Erreur sync SIV:", error);
      toast({
        variant: "destructive",
        description: "Erreur lors de la synchronisation SIV",
      });
    } finally {
      setSyncingSIV(false);
    }
  };

  const handleSyncANTAI = async () => {
    if (selectedVehicles.size === 0) {
      toast({
        variant: "destructive",
        description: "Veuillez sélectionner au moins un véhicule",
      });
      return;
    }

    setSyncingANTAI(true);
    try {
      await waitForAmplifyConfig();
      
      const selectedVehiclesList = vehicles.filter(v => selectedVehicles.has(v.immat));
      const results = [];

      for (const vehicle of selectedVehiclesList) {
        try {
          const result: any = await client.graphql({
            query: mutations.createAntaiVehicleAndInfraction,
            variables: {
              input: {
                immatriculation: vehicle.immat,
                marque: vehicle.marque || vehicle.brand?.brandName || "",
                modele: vehicle.AWN_nom_commercial || vehicle.modele?.modele || vehicle.AWN_model || "",
              }
            }
          });

          results.push({
            immat: vehicle.immat,
            success: result.data?.createAntaiVehicleAndInfraction?.success,
          });
        } catch (error) {
          console.error(`Erreur ANTAI pour ${vehicle.immat}:`, error);
          results.push({
            immat: vehicle.immat,
            success: false,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      toast({
        description: `Synchronisation ANTAI terminée : ${successCount}/${selectedVehicles.size} réussite(s)`,
      });
      
      setSelectedVehicles(new Set());
    } catch (error) {
      console.error("Erreur sync ANTAI:", error);
      toast({
        variant: "destructive",
        description: "Erreur lors de la synchronisation ANTAI",
      });
    } finally {
      setSyncingANTAI(false);
    }
  };

  const allSelected = filteredVehicles.length > 0 && 
    filteredVehicles.every(v => selectedVehicles.has(v.immat));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Véhicules de {companyName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun véhicule trouvé pour cette entreprise
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <Input
                placeholder="Rechercher par immatriculation, marque, modèle..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Filtrer par SIV</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="siv-filter"
                          checked={sivFilter === "all"}
                          onChange={() => setSivFilter("all")}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Tous</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="siv-filter"
                          checked={sivFilter === "activated"}
                          onChange={() => setSivFilter("activated")}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">SIV activé</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="siv-filter"
                          checked={sivFilter === "not_activated"}
                          onChange={() => setSivFilter("not_activated")}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">SIV non activé</span>
                      </label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <ScrollArea className="h-[calc(85vh-280px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-20">Image</TableHead>
                    <TableHead>Immatriculation</TableHead>
                    <TableHead>IMEI</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead>Modèle</TableHead>
                    <TableHead>SIV</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Énergie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle, index) => (
                    <TableRow key={vehicle.immat || index}>
                      <TableCell>
                        <Checkbox
                          checked={selectedVehicles.has(vehicle.immat)}
                          onCheckedChange={(checked) => 
                            handleSelectVehicle(vehicle.immat, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {vehicle.AWN_url_image ? (
                          <img
                            src={vehicle.AWN_url_image}
                            alt={vehicle.immat}
                            className="w-12 h-9 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-9 bg-muted rounded flex items-center justify-center">
                            <Car className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <CopyableCell value={vehicle.immat} />
                      <CopyableCell value={vehicle.device?.imei} />
                      <TableCell>{vehicle.marque || vehicle.brand?.brandName || '-'}</TableCell>
                      <TableCell>
                        {vehicle.AWN_nom_commercial || 
                         vehicle.modele?.modele || 
                         vehicle.AWN_model || 
                         '-'}
                      </TableCell>
                      <TableCell>
                        {isSivActivated(vehicle) ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Activé
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Non activé
                          </Badge>
                        )}
                      </TableCell>
                      <CopyableCell value={vehicle.VIN || vehicle.AWN_VIN} />
                      <TableCell>{vehicle.energie || vehicle.fuelType || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="text-sm text-muted-foreground pt-2 border-t">
              {filteredVehicles.length} véhicule{filteredVehicles.length > 1 ? 's' : ''} 
              {selectedVehicles.size > 0 && ` • ${selectedVehicles.size} sélectionné${selectedVehicles.size > 1 ? 's' : ''}`}
            </div>
          </>
        )}

        <DialogFooter className="gap-2">
          <Button
            onClick={handleSyncSIV}
            disabled={syncingSIV || syncingANTAI || selectedVehicles.size === 0}
            variant="outline"
          >
            {syncingSIV ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Synchroniser SIV
          </Button>
          <Button
            onClick={handleSyncANTAI}
            disabled={syncingSIV || syncingANTAI || selectedVehicles.size === 0}
          >
            {syncingANTAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Synchroniser ANTAI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
