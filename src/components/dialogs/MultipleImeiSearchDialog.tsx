
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, AlertTriangle } from "lucide-react";
import { MultipleImeiResultsTable } from "./MultipleImeiResultsTable";
import { toast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Device {
  imei: string;
  typeBoitier: string;
  sim?: string;
  telephone?: string;
  entreprise: string;
  emplacement?: string;
  type: string;
  [key: string]: any;
}

interface MultipleImeiSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Device[];
  onUpdate: (devices: Device[], newCompany: string) => void;
}

export function MultipleImeiSearchDialog({ 
  open, 
  onOpenChange,
  data,
  onUpdate
}: MultipleImeiSearchDialogProps) {
  const [imeiSearchText, setImeiSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Device[]>([]);
  const [notFoundImeis, setNotFoundImeis] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  
  // Liste des entreprises disponibles (extraite des données)
  const companies = React.useMemo(() => {
    const uniqueCompanies = new Set<string>();
    data.forEach(item => {
      if (item.entreprise) {
        uniqueCompanies.add(item.entreprise);
      }
    });
    return Array.from(uniqueCompanies).sort();
  }, [data]);

  const handleImeiSearch = () => {
    if (!imeiSearchText.trim()) {
      toast({
        description: "Veuillez entrer au moins un IMEI",
        variant: "destructive"
      });
      return;
    }

    // Extraire les IMEI multiples (séparés par virgule, espace, ou nouvelle ligne)
    const imeiList = imeiSearchText
      .split(/[,\s\n]+/)
      .map(imei => imei.trim())
      .filter(imei => imei);

    if (imeiList.length === 0) {
      toast({
        description: "Veuillez entrer des IMEI valides",
        variant: "destructive"
      });
      return;
    }

    // Rechercher dans les données
    const found: Device[] = [];
    const notFound: string[] = [];

    imeiList.forEach(imei => {
      const device = data.find(item => 
        item.imei && item.imei.toLowerCase().includes(imei.toLowerCase())
      );

      if (device) {
        found.push(device);
      } else {
        notFound.push(imei);
      }
    });

    setSearchResults(found);
    setNotFoundImeis(notFound);
    setSelectedDevices([]);
    setSearchPerformed(true);

    if (found.length === 0 && notFound.length > 0) {
      toast({
        description: "Aucun IMEI trouvé",
        variant: "destructive"
      });
    } else if (found.length > 0) {
      toast({
        description: `${found.length} boîtier(s) trouvé(s)`,
      });
    }
  };

  const handleDeviceSelection = (selectedDevices: Device[]) => {
    setSelectedDevices(selectedDevices);
  };

  const handleApplyChanges = () => {
    if (selectedDevices.length === 0) {
      toast({
        description: "Veuillez sélectionner au moins un boîtier",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCompany) {
      toast({
        description: "Veuillez sélectionner une entreprise",
        variant: "destructive"
      });
      return;
    }

    // Appel de la fonction de mise à jour avec les appareils sélectionnés
    onUpdate(selectedDevices, selectedCompany);
    
    // Réinitialiser le dialogue
    resetDialog();
  };

  const resetDialog = () => {
    setImeiSearchText("");
    setSearchResults([]);
    setNotFoundImeis([]);
    setSelectedDevices([]);
    setSearchPerformed(false);
    setSelectedCompany("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recherche Multiple d'IMEI</DialogTitle>
          <DialogDescription>
            Entrez plusieurs IMEI séparés par des virgules, des espaces ou des sauts de ligne
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Ex: 866854051690975, 864636066827169, 864454070312115"
            value={imeiSearchText}
            onChange={(e) => setImeiSearchText(e.target.value)}
            className="h-20"
          />
          
          <div className="flex justify-end">
            <Button onClick={handleImeiSearch}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {searchPerformed && (
            <div className="space-y-4">
              {notFoundImeis.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">IMEI non trouvés :</p>
                    <p className="text-yellow-700 text-sm">{notFoundImeis.join(", ")}</p>
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <MultipleImeiResultsTable 
                    devices={searchResults} 
                    onSelectionChange={handleDeviceSelection} 
                  />
                  
                  {selectedDevices.length > 0 && (
                    <div className="border p-4 rounded-md bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">Modifier l'entreprise pour {selectedDevices.length} boîtier(s) sélectionné(s)</h4>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedCompany}
                          onValueChange={setSelectedCompany}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner une entreprise" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button onClick={handleApplyChanges}>
                          Appliquer les modifications
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
