import { DeleteConfirmationDialog } from "@/components/dialogs/DeleteConfirmationDialog";
import { CopyableCell } from "@/components/tables/CopyableCell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getLazyClient, waitForAmplifyConfig, withCredentialRetry } from '@/config/aws-config.js';
import * as mutations from '@/graphql/mutations';
import * as queries from '@/graphql/queries';
import { toast } from "@/hooks/use-toast";
import { deleteVehicleData } from "@/services/VehicleService";
import { fetchVehicleInfoByPlate, mapAWNToVehicleFields } from "@/services/AutoWaysService";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertCircle, Car, CheckCircle, CheckCircle2, Download, Filter, Loader2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from 'xlsx';

const client = getLazyClient();

// Fonction utilitaire pour tronquer le modèle à 20 caractères max
const truncateModel = (model: string): string => {
  if (!model || model.length <= 20) return model;
  
  // Tronquer à 20 caractères
  const truncated = model.substring(0, 20);
  
  // Chercher le dernier espace
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // Si on trouve un espace, couper à cet espace
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex);
  }
  
  // Sinon, retourner les 20 premiers caractères
  return truncated;
};

interface CompanyVehiclesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  haveAntai?: boolean;
  hasAntaiSubscription?: boolean;
  onAntaiStatusChange?: (companyId: string, haveAntai: boolean) => void;
}

export function CompanyVehiclesDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
  haveAntai = false,
  hasAntaiSubscription = false,
  onAntaiStatusChange,
}: CompanyVehiclesDialogProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [syncingSIV, setSyncingSIV] = useState(false);
  const [syncingANTAI, setSyncingANTAI] = useState(false);
  const [desyncingANTAI, setDesyncingANTAI] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [sivFilter, setSivFilter] = useState<"all" | "activated" | "not_activated">("all");
  const [antaiActivated, setAntaiActivated] = useState(haveAntai);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  useEffect(() => {
    if (open && companyId) {
      fetchVehicles();
      setSelectedVehicles(new Set());
      setFilterText("");
      setSivFilter("all");
    }
  }, [open, companyId]);

  // Synchroniser antaiActivated avec haveAntai
  useEffect(() => {
    setAntaiActivated(haveAntai);
  }, [haveAntai]);

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

  // Helper function to check if immatriculation is compatible with ANTAI
  // Format français requis: 2 lettres + 3 chiffres + 2 lettres (ex: EL639ZK, EL 639 ZK, EL-639-ZK)
  // Ignore tout ce qui vient après l'immatriculation (ex: "FJ-006-MR NOUVEAU" → "FJ006MR")
  const isImmatCompatibleWithAntai = (immat: string): boolean => {
    if (!immat || typeof immat !== 'string') return false;
    
    // Clean the immatriculation: remove spaces, dashes, and convert to uppercase
    const cleanedImmat = immat.replace(/[\s-]/g, '').toUpperCase();
    
    // Extract only the first 7 alphanumeric characters (ignore words like "NOUVEAU")
    const immatOnly = cleanedImmat.substring(0, 7);
    
    // Must be exactly 7 characters
    if (immatOnly.length !== 7) return false;
    
    // Must match French format: 2 letters + 3 digits + 2 letters
    // Example: EL639ZK, FJ006MR
    const frenchFormat = /^[A-Z]{2}\d{3}[A-Z]{2}$/;
    return frenchFormat.test(immatOnly);
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

  // Count ANTAI compatible vehicles
  const antaiCompatibleCount = useMemo(() => {
    return filteredVehicles.filter(v => isImmatCompatibleWithAntai(v.immat)).length;
  }, [filteredVehicles]);

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
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      await waitForAmplifyConfig();
      
      // Récupérer les véhicules sélectionnés
      const vehiclesToSync = vehicles.filter(v => selectedVehicles.has(v.immat));
      
      console.log(`🚗 SIV: Synchronisation de ${vehiclesToSync.length} véhicule(s)`);
      
      // Traiter par lots de 3 pour ne pas surcharger l'API
      const batchSize = 3;
      for (let i = 0; i < vehiclesToSync.length; i += batchSize) {
        const batch = vehiclesToSync.slice(i, i + batchSize);
        
        // Traiter le lot en parallèle
        const results = await Promise.all(
          batch.map(async (vehicle) => {
            try {
              // Appeler l'API Auto Ways Network
              const awnResponse = await fetchVehicleInfoByPlate(vehicle.immat);
              
              if (!awnResponse.success || !awnResponse.data) {
                console.warn(`⚠️ SIV: Véhicule ${vehicle.immat} - ${awnResponse.error}`);
                return { success: false, immat: vehicle.immat, error: awnResponse.error };
              }
              
              // Mapper les données AWN vers les champs du véhicule
              const awnFields = mapAWNToVehicleFields(awnResponse.data);
              
              // Mettre à jour le véhicule dans la base de données
              await client.graphql({
                query: mutations.updateVehicle,
                variables: {
                  input: {
                    immat: vehicle.immat,
                    ...awnFields,
                  }
                }
              });
              
              console.log(`✅ SIV: Véhicule ${vehicle.immat} mis à jour`);
              return { success: true, immat: vehicle.immat };
              
            } catch (error) {
              console.error(`❌ SIV: Erreur pour ${vehicle.immat}:`, error);
              return { success: false, immat: vehicle.immat, error: 'Erreur de mise à jour' };
            }
          })
        );
        
        // Compter les succès et erreurs
        results.forEach(r => {
          if (r.success) {
            successCount++;
          } else {
            errorCount++;
            if (r.error) errors.push(`${r.immat}: ${r.error}`);
          }
        });
        
        // Petite pause entre les lots
        if (i + batchSize < vehiclesToSync.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Rafraîchir la liste des véhicules
      await fetchVehicles();
      
      // Afficher le résultat
      let message = `Synchronisation SIV terminée : ${successCount} véhicule(s) mis à jour`;
      if (errorCount > 0) {
        message += `, ${errorCount} échec(s)`;
      }
      
      toast({
        variant: errorCount > 0 && successCount === 0 ? "destructive" : "default",
        description: message,
      });
      
      if (errors.length > 0 && errors.length <= 3) {
        console.log("Détails des erreurs:", errors);
      }
      
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

  const confirmActivateANTAI = () => {
    setShowActivateConfirm(true);
  };

  const confirmDeactivateANTAI = () => {
    setShowDeactivateConfirm(true);
  };

  const handleSyncANTAI = async () => {
    setShowActivateConfirm(false);
    
    if (vehicles.length === 0) {
      toast({
        variant: "destructive",
        description: "Aucun véhicule à synchroniser",
      });
      return;
    }

    setSyncingANTAI(true);
    try {
      await waitForAmplifyConfig();
      
      // Filter only ANTAI-compatible vehicles
      const compatibleVehicles = vehicles.filter(vehicle => 
        isImmatCompatibleWithAntai(vehicle.immat)
      );

      if (compatibleVehicles.length === 0) {
        toast({
          variant: "destructive",
          description: "Aucun véhicule avec immatriculation compatible ANTAI",
        });
        setSyncingANTAI(false);
        return;
      }

      console.log(`📦 ${compatibleVehicles.length}/${vehicles.length} véhicules compatibles ANTAI`);
      
      // Préparer les données des véhicules compatibles
      const vehiculesData = compatibleVehicles.map(vehicle => {
        // Extract only the first 7 characters of the immat (ignore words like "NOUVEAU")
        const cleanImmat = (vehicle.immat?.replace(/[\s-]/g, '').toUpperCase() || '').substring(0, 7);
        return {
          immatriculation: cleanImmat,
          paysImmatriculation: "FRA",
          marque: vehicle.marque || vehicle.brand?.brandName || "",
          modele: truncateModel(vehicle.AWN_nom_commercial || vehicle.modele?.modele || vehicle.AWN_model || ""),
        };
      });

      // Traiter par lots de 5
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < vehiculesData.length; i += batchSize) {
        batches.push(vehiculesData.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;

      // Traiter chaque lot
      for (const batch of batches) {
        try {
          const request = JSON.stringify({
            action: "createFlotteVehicules",
            vehicules: batch
          });

          const result: any = await client.graphql({
            query: queries.antaiQuery,
            variables: { request }
          });

          if (result.data?.antaiQuery?.success) {
            successCount += batch.length;
          } else {
            errorCount += batch.length;
          }
        } catch (error) {
          console.error(`Erreur ANTAI pour le lot:`, error);
          errorCount += batch.length;
        }
      }

      // Mettre à jour haveAntai sur la company si succès
      if (successCount > 0) {
        try {
          await client.graphql({
            query: mutations.updateCompany,
            variables: {
              input: {
                id: companyId,
                haveAntai: true
              }
            }
          });
          setAntaiActivated(true);
          
          // Notifier le parent de la mise à jour
          if (onAntaiStatusChange) {
            onAntaiStatusChange(companyId, true);
          }
        } catch (error) {
          console.error("Erreur mise à jour company:", error);
        }
      }
      
      // Calculer les véhicules non compatibles
      const incompatibleCount = vehicles.length - compatibleVehicles.length;
      
      let message = `Activation ANTAI terminée : ${successCount} véhicule(s) synchronisé(s) avec succès`;
      if (incompatibleCount > 0) {
        message += `. ${incompatibleCount} véhicule(s) ignoré(s) (immatriculation non compatible ANTAI)`;
      }
      if (errorCount > 0) {
        message += `. ${errorCount} échec(s)`;
      }
      
      toast({
        description: message,
      });
    } catch (error) {
      console.error("Erreur activation ANTAI:", error);
      toast({
        variant: "destructive",
        description: "Erreur lors de l'activation ANTAI",
      });
    } finally {
      setSyncingANTAI(false);
    }
  };

  // Fonction pour resynchroniser la flotte ANTAI (quand déjà activé)
  const handleResyncANTAI = async () => {
    if (vehicles.length === 0) {
      toast({
        variant: "destructive",
        description: "Aucun véhicule à synchroniser",
      });
      return;
    }

    setSyncingANTAI(true);
    try {
      await waitForAmplifyConfig();
      
      // Filter only ANTAI-compatible vehicles
      const compatibleVehicles = vehicles.filter(vehicle => 
        isImmatCompatibleWithAntai(vehicle.immat)
      );

      if (compatibleVehicles.length === 0) {
        toast({
          variant: "destructive",
          description: "Aucun véhicule avec immatriculation compatible ANTAI",
        });
        setSyncingANTAI(false);
        return;
      }

      console.log(`📦 ${compatibleVehicles.length}/${vehicles.length} véhicules compatibles ANTAI`);
      
      // Préparer les données des véhicules compatibles
      const vehiculesData = compatibleVehicles.map(vehicle => {
        // Extract only the first 7 characters of the immat (ignore words like "NOUVEAU")
        const cleanImmat = (vehicle.immat?.replace(/[\s-]/g, '').toUpperCase() || '').substring(0, 7);
        return {
          immatriculation: cleanImmat,
          paysImmatriculation: "FRA",
          marque: vehicle.marque || vehicle.brand?.brandName || "",
          modele: truncateModel(vehicle.AWN_nom_commercial || vehicle.modele?.modele || vehicle.AWN_model || ""),
        };
      });

      // Traiter par lots de 5
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < vehiculesData.length; i += batchSize) {
        batches.push(vehiculesData.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;

      // Traiter chaque lot
      for (const batch of batches) {
        try {
          const request = JSON.stringify({
            action: "createFlotteVehicules",
            vehicules: batch
          });

          const result: any = await client.graphql({
            query: queries.antaiQuery,
            variables: { request }
          });

          if (result.data?.antaiQuery?.success) {
            successCount += batch.length;
          } else {
            errorCount += batch.length;
          }
        } catch (error) {
          console.error(`Erreur ANTAI pour le lot:`, error);
          errorCount += batch.length;
        }
      }
      
      // Calculer les véhicules non compatibles
      const incompatibleCount = vehicles.length - compatibleVehicles.length;
      
      let message = `Synchronisation ANTAI terminée : ${successCount} véhicule(s) synchronisé(s) avec succès`;
      if (incompatibleCount > 0) {
        message += `. ${incompatibleCount} véhicule(s) ignoré(s) (immatriculation non compatible ANTAI)`;
      }
      if (errorCount > 0) {
        message += `. ${errorCount} échec(s)`;
      }
      
      toast({
        description: message,
      });
    } catch (error) {
      console.error("Erreur synchronisation ANTAI:", error);
      toast({
        variant: "destructive",
        description: "Erreur lors de la synchronisation ANTAI",
      });
    } finally {
      setSyncingANTAI(false);
    }
  };

  const handleDesyncANTAI = async () => {
    setShowDeactivateConfirm(false);
    
    if (vehicles.length === 0) {
      toast({
        variant: "destructive",
        description: "Aucun véhicule à désynchroniser",
      });
      return;
    }

    setDesyncingANTAI(true);
    try {
      await waitForAmplifyConfig();
      
      // Filter only ANTAI-compatible vehicles
      const compatibleVehicles = vehicles.filter(vehicle => 
        isImmatCompatibleWithAntai(vehicle.immat)
      );

      if (compatibleVehicles.length === 0) {
        toast({
          variant: "destructive",
          description: "Aucun véhicule avec immatriculation compatible ANTAI",
        });
        setDesyncingANTAI(false);
        return;
      }

      console.log(`📦 ${compatibleVehicles.length}/${vehicles.length} véhicules compatibles ANTAI`);
      
      // Préparer les données des véhicules compatibles pour la désynchronisation
      const vehiculesData = compatibleVehicles.map(vehicle => ({
        vehicule: {
          immatriculation: vehicle.immat?.replace(/[\s-]/g, '').toUpperCase() || '',
          paysImmatriculation: "FRA",
          marque: vehicle.marque || vehicle.brand?.brandName || "",
          modele: truncateModel(vehicle.AWN_nom_commercial || vehicle.modele?.modele || vehicle.AWN_model || ""),
        }
      }));

      // Traiter par lots de 5
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < vehiculesData.length; i += batchSize) {
        batches.push(vehiculesData.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;

      // Traiter chaque lot
      for (const batch of batches) {
        try {
          const request = JSON.stringify({
            action: "deleteFlotteVehicules",
            vehicules: batch
          });

          const result: any = await client.graphql({
            query: queries.antaiQuery,
            variables: { request }
          });

          if (result.data?.antaiQuery?.success) {
            successCount += batch.length;
          } else {
            errorCount += batch.length;
          }
        } catch (error) {
          console.error(`Erreur ANTAI désync pour le lot:`, error);
          errorCount += batch.length;
        }
      }

      // Mettre à jour haveAntai à false sur la company
      try {
        await client.graphql({
          query: mutations.updateCompany,
          variables: {
            input: {
              id: companyId,
              haveAntai: false
            }
          }
        });
        setAntaiActivated(false);
        
        // Notifier le parent de la mise à jour
        if (onAntaiStatusChange) {
          onAntaiStatusChange(companyId, false);
        }
      } catch (error) {
        console.error("Erreur mise à jour company:", error);
      }
      
      toast({
        description: `Désactivation ANTAI terminée : ${successCount} réussite(s), ${errorCount} échec(s)`,
      });
    } catch (error) {
      console.error("Erreur désactivation ANTAI:", error);
      toast({
        variant: "destructive",
        description: "Erreur lors de la désactivation ANTAI",
      });
    } finally {
      setDesyncingANTAI(false);
    }
  };

  const handleDeleteVehicle = async (vehicle: any) => {
    try {
      await deleteVehicleData({
        immat: vehicle.immat,
        immatriculation: vehicle.immat
      });
      
      toast({
        description: `Véhicule ${vehicle.immat} supprimé avec succès`,
      });
      
      // Refresh the list
      await fetchVehicles();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        variant: "destructive",
        description: "Erreur lors de la suppression du véhicule",
      });
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredVehicles.map(vehicle => ({
      'Immatriculation': vehicle.immat || '',
      'IMEI': vehicle.device?.imei || '',
      'Marque': vehicle.marque || vehicle.brand?.brandName || '',
      'Modèle': vehicle.AWN_nom_commercial || vehicle.modele?.modele || vehicle.AWN_model || '',
      'VIN': vehicle.VIN || vehicle.AWN_VIN || '',
      'Énergie': vehicle.energie || vehicle.fuelType || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Véhicules');
    
    const fileName = `vehicules_${companyName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      description: `Export Excel réussi : ${filteredVehicles.length} véhicule(s)`,
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(16);
    doc.text(`Véhicules de ${companyName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);

    // Données du tableau
    const tableData = filteredVehicles.map(vehicle => [
      vehicle.immat || '',
      vehicle.device?.imei || '',
      vehicle.marque || vehicle.brand?.brandName || '',
      vehicle.AWN_nom_commercial || vehicle.modele?.modele || vehicle.AWN_model || '',
      vehicle.VIN || vehicle.AWN_VIN || '',
      vehicle.energie || vehicle.fuelType || '',
    ]);

    autoTable(doc, {
      head: [['Immat.', 'IMEI', 'Marque', 'Modèle', 'VIN', 'Énergie']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] },
    });

    const fileName = `vehicules_${companyName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    toast({
      description: `Export PDF réussi : ${filteredVehicles.length} véhicule(s)`,
    });
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
                    <TableHead className="w-20">Actions</TableHead>
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
                        <div className="flex items-center justify-center">
                          {(vehicle.AWN_model_image || vehicle.AWN_url_image) ? (
                            <img
                              src={vehicle.AWN_model_image || vehicle.AWN_url_image}
                              alt={vehicle.immat || 'Véhicule'}
                              className="w-16 h-12 object-contain rounded"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                // Si l'image du modèle échoue, essayer l'image de marque
                                if (vehicle.AWN_model_image && img.src !== vehicle.AWN_url_image && vehicle.AWN_url_image) {
                                  img.src = vehicle.AWN_url_image;
                                } else {
                                  img.src = '/placeholder.svg';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                              <Car className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="relative group">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span>{vehicle.immat || '-'}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {isImmatCompatibleWithAntai(vehicle.immat) ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {isImmatCompatibleWithAntai(vehicle.immat) ? (
                                  <p>✓ Immatriculation compatible avec ANTAI</p>
                                ) : (
                                  <div>
                                    <p>⚠ Immatriculation non compatible avec ANTAI</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Exemple valide : AB-123-CD ou AB 123 CD
                                    </p>
                                  </div>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
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
                      <TableCell>
                        <DeleteConfirmationDialog
                          title={vehicle.device?.imei ? "Véhicule associé à un boîtier" : "Supprimer le véhicule"}
                          description={
                            vehicle.device?.imei
                              ? `Ce véhicule (${vehicle.immat}) est actuellement associé au boîtier ${vehicle.device.imei}. Êtes-vous sûr de vouloir le supprimer ? Cette action est irréversible.`
                              : `Êtes-vous sûr de vouloir supprimer le véhicule ${vehicle.immat} ? Cette action est irréversible.`
                          }
                          onConfirm={() => handleDeleteVehicle(vehicle)}
                        />
                      </TableCell>
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
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Statut ANTAI:</span>
              <Badge variant={antaiActivated ? "default" : "secondary"}>
                {antaiActivated ? "Activé" : "Non activé"}
              </Badge>
              {hasAntaiSubscription && !antaiActivated && (
                <Badge variant="outline" className="text-xs">
                  Abonnement souscrit
                </Badge>
              )}
            </div>
            {hasAntaiSubscription && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>•</span>
                <span>{antaiCompatibleCount}/{filteredVehicles.length} compatible{antaiCompatibleCount > 1 ? 's' : ''} ANTAI</span>
              </div>
            )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={filteredVehicles.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={handleExportExcel}
                >
                  Export Excel
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={handleExportPDF}
                >
                  Export PDF
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleSyncSIV}
            disabled={syncingSIV || syncingANTAI || desyncingANTAI || selectedVehicles.size === 0}
            variant="outline"
          >
            {syncingSIV ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Synchroniser SIV
          </Button>
          {!antaiActivated ? (
            <Button
              onClick={confirmActivateANTAI}
              disabled={syncingSIV || syncingANTAI || desyncingANTAI || vehicles.length === 0}
            >
              {syncingANTAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Activer ANTAI
            </Button>
          ) : (
            <>
              <Button
                onClick={handleResyncANTAI}
                disabled={syncingSIV || syncingANTAI || desyncingANTAI || vehicles.length === 0}
                variant="outline"
              >
                {syncingANTAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Synchroniser ANTAI
              </Button>
              <Button
                onClick={confirmDeactivateANTAI}
                disabled={syncingSIV || syncingANTAI || desyncingANTAI || vehicles.length === 0}
                variant="destructive"
              >
                {desyncingANTAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Désactiver ANTAI
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Dialog - Activate ANTAI */}
      <AlertDialog open={showActivateConfirm} onOpenChange={setShowActivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activer ANTAI pour {companyName}</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point d'activer la synchronisation ANTAI pour <strong>{vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}</strong> de l'entreprise <strong>{companyName}</strong>.
              <br /><br />
              Cette action ajoutera tous les véhicules à la flotte ANTAI de l'entreprise.
              <br /><br />
              Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSyncANTAI}>
              Confirmer l'activation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog - Deactivate ANTAI */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver ANTAI pour {companyName}</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de désactiver la synchronisation ANTAI pour <strong>{vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}</strong> de l'entreprise <strong>{companyName}</strong>.
              <br /><br />
              Cette action retirera tous les véhicules de la flotte ANTAI de l'entreprise.
              <br /><br />
              Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDesyncANTAI} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmer la désactivation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
