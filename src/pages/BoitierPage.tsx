import AssociateDeviceDialog from '@/components/dialogs/AssociateDeviceDialog';
import EditDeviceDialog from '@/components/dialogs/EditDeviceDialog';
import AddDeviceForm from "@/components/forms/AddDeviceForm";
import AddDeviceWithVehicleForm from "@/components/forms/AddDeviceWithVehicleForm";
import ImportDevicesForm from "@/components/forms/ImportDevicesForm";
import ImportVehiclesForm from "@/components/forms/ImportVehiclesForm";
import { EnhancedDataTable } from "@/components/tables/EnhancedDataTable";
import { Button } from "@/components/ui/button";
import { CompanySearchSelect } from "@/components/ui/company-search-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useCompanyVehicleDevice } from "@/hooks/useCompanyVehicleDevice.jsx";
import { useInfiniteDevices } from "@/hooks/useInfiniteDevices";
import { ArrowUp, Building, Car, FileSpreadsheet, Filter, Link2, Link2Off, Loader2, Package, Pencil, RefreshCw, Search, Wifi } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

export default function BoitierPage() {
  const {
    devices,
    loading,
    hasMore,
    loadMore,
    reset,
    searchByImeis,
    loadWithCompanyFilter,
    cancelSearch,
    updateDevice
  } = useInfiniteDevices();

  const { companies } = useCompanyVehicleDevice();

  // Search states
  const [searchImeis, setSearchImeis] = useState<string[]>([]);
  const [currentImei, setCurrentImei] = useState('');
  const [searchImmats, setSearchImmats] = useState<string[]>([]);
  const [activeImmatFilter, setActiveImmatFilter] = useState<string[]>([]);
  const [currentImmat, setCurrentImmat] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCompanyFiltering, setIsCompanyFiltering] = useState(false);
  
  // Dialog states
  const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false);
  const [showImportDevicesDialog, setShowImportDevicesDialog] = useState(false);
  const [showImportVehiclesDialog, setShowImportVehiclesDialog] = useState(false);
  const [showAddDeviceWithVehicleDialog, setShowAddDeviceWithVehicleDialog] = useState(false);
  const [selectedDeviceForDialog, setSelectedDeviceForDialog] = useState<any>(null);
  const [selectedDeviceForEdit, setSelectedDeviceForEdit] = useState<any>(null);
  const [showEditDeviceDialog, setShowEditDeviceDialog] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Auto-load first batch on mount
  useEffect(() => {
    if (devices.length === 0 && !loading && hasMore) {
      loadMore();
    }
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle company filter change
  useEffect(() => {
    if (selectedCompany) {
      setIsCompanyFiltering(true);
      loadWithCompanyFilter(selectedCompany).finally(() => {
        setIsCompanyFiltering(false);
      });
    }
    // Don't auto-refresh when clearing company filter - let user do it manually
  }, [selectedCompany]);

  // Infinite scroll observer - disabled when company filter is active
  useEffect(() => {
    if (selectedCompany) return; // Don't use infinite scroll when filtering by company
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log('Loading more devices...');
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore, selectedCompany]);

  const handleAddImei = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentImei.trim()) {
      e.preventDefault();
      if (!searchImeis.includes(currentImei.trim())) {
        setSearchImeis(prev => [...prev, currentImei.trim()]);
      }
      setCurrentImei('');
    }
  }, [currentImei, searchImeis]);

  const handleRemoveImei = useCallback((imeiToRemove: string) => {
    setSearchImeis(prev => prev.filter(imei => imei !== imeiToRemove));
  }, []);

  const handleAddImmat = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentImmat.trim()) {
      e.preventDefault();
      const normalizedImmat = currentImmat.trim().toUpperCase();
      if (!searchImmats.includes(normalizedImmat)) {
        setSearchImmats(prev => [...prev, normalizedImmat]);
      }
      setCurrentImmat('');
    }
  }, [currentImmat, searchImmats]);

  const handleRemoveImmat = useCallback((immatToRemove: string) => {
    setSearchImmats(prev => prev.filter(immat => immat !== immatToRemove));
  }, []);

  const handleSearchByImmats = useCallback(() => {
    if (searchImmats.length === 0) {
      toast({
        title: "Aucune immatriculation",
        description: "Veuillez saisir au moins une immatriculation",
        variant: "destructive",
      });
      return;
    }
    setActiveImmatFilter(searchImmats);
    toast({
      title: "Filtre appliqué",
      description: `Filtrage par ${searchImmats.length} immatriculation(s)`,
    });
  }, [searchImmats]);

  const handleClearImmatSearch = useCallback(() => {
    setSearchImmats([]);
    setCurrentImmat('');
    setActiveImmatFilter([]);
  }, []);

  const handleSearchByImeis = useCallback(async () => {
    if (searchImeis.length === 0) {
      toast({
        title: "Aucun IMEI",
        description: "Veuillez saisir au moins un IMEI",
        variant: "destructive",
      });
      return;
    }
    
    const results = await searchByImeis(searchImeis);
    setSearchResults(results);
  }, [searchImeis, searchByImeis]);

  const handleClearSearch = useCallback(() => {
    setSearchImeis([]);
    setCurrentImei('');
    setSearchImmats([]);
    setActiveImmatFilter([]);
    setCurrentImmat('');
    setSearchResults([]);
    setShowAvailableOnly(false);
  }, []);

  // Apply client-side filters
  const displayDevices = searchResults.length > 0 ? searchResults : devices;
  const filteredDevices = displayDevices.filter(device => {
    // Filter for available devices (no vehicle or no company)
    const matchesAvailability = !showAvailableOnly || 
      (!device.immatriculation || !device.entreprise || device.entreprise === "Boîtier libre");
    
    // Filter by immatriculation (only if filter is active)
    const matchesImmat = activeImmatFilter.length === 0 || 
      (device.immatriculation && activeImmatFilter.some(immat => 
        device.immatriculation.toUpperCase().includes(immat.toUpperCase())
      ));
    
    return matchesAvailability && matchesImmat;
  });

  const handleRefresh = useCallback(() => {
    reset();
    loadMore();
    setSearchImeis([]);
    setCurrentImei('');
    setSearchImmats([]);
    setActiveImmatFilter([]);
    setCurrentImmat('');
    setSelectedCompany('');
    setSearchResults([]);
    setShowAvailableOnly(false);
  }, [reset, loadMore]);

  const handleDeviceAdded = useCallback(() => {
    handleRefresh();
    toast({
      title: "Boîtier(s) créé(s)",
      description: "Les boîtiers ont été créés avec succès",
    });
  }, [handleRefresh]);

  const handleDeviceWithVehicleAdded = useCallback(() => {
    setShowAddDeviceWithVehicleDialog(false);
    handleRefresh();
    toast({
      title: "Création réussie",
      description: "Device + Véhicule créés et associés avec succès",
    });
  }, [handleRefresh]);

  // Optimized refresh after association/dissociation - preserves filters
  const handleAssociationSuccess = useCallback(async (updatedDevice: any) => {
    console.log('🔄 Association/dissociation réussie, mise à jour optimisée...');
    
    // Update the device in the hook's state
    if (updateDevice) {
      updateDevice(updatedDevice);
    }
    
    // If there are search results, update them too
    if (searchResults.length > 0) {
      setSearchResults(prevResults => {
        return prevResults.map(device => {
          if (device.imei === updatedDevice.imei) {
            return { ...device, ...updatedDevice };
          }
          return device;
        });
      });
    }
  }, [searchResults, updateDevice]);

  const handleAssociationClick = useCallback((device: any) => {
    setSelectedDeviceForDialog(device);
  }, []);

  const handleDialogClose = useCallback(() => {
    setSelectedDeviceForDialog(null);
  }, []);

  const handleEditClick = useCallback((device: any) => {
    setSelectedDeviceForEdit(device);
    setShowEditDeviceDialog(true);
  }, []);

  const handleEditSuccess = useCallback((updatedDevice: any) => {
    // Update the device in the hook's state
    if (updateDevice) {
      updateDevice(updatedDevice);
    }
    
    // If there are search results, update them too
    if (searchResults.length > 0) {
      setSearchResults(prevResults => {
        return prevResults.map(device => {
          if (device.imei === updatedDevice.imei) {
            return { ...device, ...updatedDevice };
          }
          return device;
        });
      });
    }

    toast({
      title: "Mise à jour réussie",
      description: "Les informations du boîtier ont été mises à jour",
    });
  }, [searchResults, updateDevice]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Define columns for the table
  const columns = [
    {
      id: "imei",
      label: "IMEI",
      sortable: true,
      visible: true,
      renderCell: (value) => (
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {value || "Non assigné"}
        </span>
      )
    },
    {
      id: "entreprise",
      label: "Entreprise",
      sortable: true,
      visible: true,
      renderCell: (value, row) => {
        // If value looks like an ID (no spaces, alphanumeric), try to find company name
        let displayName = value;
        if (value && !value.includes(' ') && row.companyId) {
          const company = companies.find(c => c.id === row.companyId);
          displayName = company?.name || value;
        }
        
        return (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className={row.isAssociated ? "" : "text-primary font-medium"}>
                {displayName || "Entreprise non définie"}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.isAssociated ? "Boîtier assigné" : "Boîtier disponible"}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      id: "immatriculation",
      label: "Véhicule associé",
      sortable: true,
      visible: true,
      renderCell: (value) => (
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {value || "Non assigné"}
        </span>
      )
    },
    {
      id: "protocolId",
      label: "Protocol",
      sortable: true,
      visible: true,
      renderCell: (value) => (
        <span className="font-medium">
          {value || "Aucun protocole"}
        </span>
      )
    },
    {
      id: "sim",
      label: "SIM",
      sortable: true,
      visible: true,
      renderCell: (value) => (
        <span className={value ? "" : "text-muted-foreground"}>
          {value || "Pas de SIM"}
        </span>
      )
    },
    {
      id: "statut",
      label: "Statut",
      sortable: true,
      visible: true,
      renderCell: (value, row) => {
        let status = "Inconnu";
        let badgeClass = "bg-secondary text-secondary-foreground";

        if (!row.isAssociated && row.entreprise === "Boîtier libre") {
          status = "Libre";
          badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
        } else if (row.isAssociated && row.immatriculation) {
          status = "Associé véhicule";
          badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
        } else if (row.entreprise && row.entreprise !== "Boîtier libre") {
          status = "Réservé client";
          badgeClass = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
            {status}
          </span>
        );
      }
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      visible: true,
    renderCell: (value: any, row: any) => (
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleEditClick(row)}
          className="text-primary border-primary hover:bg-primary/10"
          title="Modifier SIM/Téléphone"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleAssociationClick(row)}
          className={
            row.isAssociated && row.immatriculation
              ? "text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
              : "text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          }
          title={row.isAssociated && row.immatriculation ? "Dissocier" : "Associer"}
        >
          {row.isAssociated && row.immatriculation ? (
            <Link2Off className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
    },
  ];

  // Quick stats for devices
  const displayData = searchResults.length > 0 ? searchResults : devices;
  const stats = {
    total: displayData.length,
    available: displayData.filter(d => !d.isAssociated).length,
    associated: displayData.filter(d => d.isAssociated).length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wifi className="h-8 w-8 text-primary" />
            Gestion des Boîtiers
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedCompany 
              ? "Affichage des boîtiers de l'entreprise sélectionnée"
              : "Rechercher et gérer les boîtiers GPS"
            }
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={showAddDeviceDialog} onOpenChange={setShowAddDeviceDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              Ajouter Boîtier(s)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un ou plusieurs boîtiers</DialogTitle>
            </DialogHeader>
            <AddDeviceForm onClose={() => setShowAddDeviceDialog(false)} onSuccess={handleDeviceAdded} />
          </DialogContent>
        </Dialog>

        <Dialog open={showImportDevicesDialog} onOpenChange={setShowImportDevicesDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importer Boîtiers
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ImportDevicesForm 
              onClose={() => setShowImportDevicesDialog(false)} 
              onSuccess={() => reset()}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showAddDeviceWithVehicleDialog} onOpenChange={setShowAddDeviceWithVehicleDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Car className="h-4 w-4 mr-2" />
              Ajouter Véhicule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un véhicule</DialogTitle>
            </DialogHeader>
            <AddDeviceWithVehicleForm onSuccess={handleDeviceWithVehicleAdded} />
          </DialogContent>
        </Dialog>

        <Dialog open={showImportVehiclesDialog} onOpenChange={setShowImportVehiclesDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importer Véhicules
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ImportVehiclesForm 
              onClose={() => setShowImportVehiclesDialog(false)} 
              onSuccess={() => reset()}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats - Hidden */}
      {false && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Boîtiers chargés</div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {selectedCompany 
                ? "Résultats filtrés par entreprise"
                : hasMore 
                  ? "Chargement par lots de 50" 
                  : "Tous les boîtiers chargés"
              }
            </div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Disponibles</div>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-xs text-muted-foreground mt-1">Dans les boîtiers chargés</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Associés</div>
            <div className="text-2xl font-bold text-blue-600">{stats.associated}</div>
            <div className="text-xs text-muted-foreground mt-1">Dans les boîtiers chargés</div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="p-6 rounded-lg border bg-card space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Search className="h-5 w-5" />
          Rechercher par IMEI
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="searchImei">IMEI (Appuyez sur Entrée pour ajouter)</Label>
            <Input
              id="searchImei"
              placeholder="Saisir un IMEI et appuyer sur Entrée"
              value={currentImei}
              onChange={(e) => setCurrentImei(e.target.value)}
              onKeyDown={handleAddImei}
            />
          </div>

          {searchImeis.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchImeis.map((imei) => (
                <div
                  key={imei}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  <span className="text-sm font-medium">{imei}</span>
                  <button
                    onClick={() => handleRemoveImei(imei)}
                    className="hover:text-destructive transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleSearchByImeis} 
              disabled={searchImeis.length === 0 || loading}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher {searchImeis.length > 0 && `(${searchImeis.length})`}
            </Button>
            {(searchImeis.length > 0 || searchResults.length > 0 || searchImmats.length > 0) && (
              <Button 
                onClick={handleClearSearch} 
                variant="outline"
              >
                Effacer
              </Button>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="searchImmat">Filtrer par Immatriculation</Label>
            <Input
              id="searchImmat"
              placeholder="Saisir une immatriculation et appuyer sur Entrée"
              value={currentImmat}
              onChange={(e) => setCurrentImmat(e.target.value)}
              onKeyDown={handleAddImmat}
            />
            <p className="text-xs text-muted-foreground">
              Appuyez sur Entrée pour ajouter chaque immatriculation
            </p>
          </div>

          {searchImmats.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {searchImmats.map((immat) => (
                  <div
                    key={immat}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800"
                  >
                    <span className="text-sm font-medium">{immat}</span>
                    <button
                      onClick={() => handleRemoveImmat(immat)}
                      className="hover:text-destructive transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSearchByImmats} 
                  disabled={searchImmats.length === 0}
                  variant="default"
                  className="flex-1"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Filtrer {searchImmats.length > 0 && `(${searchImmats.length})`}
                </Button>
                <Button 
                  onClick={handleClearImmatSearch} 
                  variant="outline"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="searchEntreprise">Filtrer par Entreprise</Label>
            <div className="flex gap-2">
              <CompanySearchSelect
                value={selectedCompany}
                onValueChange={setSelectedCompany}
                placeholder="Filtrer par entreprise"
                disabled={isCompanyFiltering || loading}
              />
              {selectedCompany && (
                <Button 
                  onClick={() => {
                    cancelSearch();
                    setSelectedCompany('');
                  }} 
                  variant="outline"
                  disabled={!isCompanyFiltering && !selectedCompany}
                >
                  Annuler
                </Button>
              )}
            </div>
            {isCompanyFiltering && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Recherche en cours, veuillez patienter... (Cliquez sur "Annuler" pour arrêter)
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant={showAvailableOnly ? "default" : "outline"}
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className="flex-1"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAvailableOnly ? "Afficher tous les boîtiers" : "Boîtiers disponibles uniquement"}
            </Button>
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
        
        {searchResults.length > 0 && (
          <div className="text-sm text-primary font-medium">
            ✓ {searchResults.length} boîtier(s) trouvé(s) sur {searchImeis.length} IMEI(s) recherché(s)
          </div>
        )}
        
        {activeImmatFilter.length > 0 && (
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            ✓ {filteredDevices.length} boîtier(s) avec immatriculation(s) : {activeImmatFilter.join(', ')}
          </div>
        )}
        
        {selectedCompany && devices.length > 0 && !isCompanyFiltering && (
          <div className="text-sm text-primary font-medium">
            ✓ {filteredDevices.length} boîtier(s) trouvé(s) pour cette entreprise
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-lg border bg-card overflow-visible">
        <EnhancedDataTable
          data={filteredDevices}
          columns={columns}
          loading={loading && devices.length === 0}
          enablePagination={false}
        />
      </div>
      
      {/* Infinite scroll trigger - only show when not in search mode and not filtering by company */}
      {searchResults.length === 0 && !selectedCompany && (
        <div 
          ref={observerTarget} 
          className="flex justify-center py-6"
        >
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Chargement de 100 boîtiers supplémentaires...</span>
            </div>
          )}
          {!hasMore && devices.length > 0 && (
            <p className="text-muted-foreground text-sm">
              ✓ Tous les boîtiers ont été chargés ({stats.total} au total)
            </p>
          )}
          {devices.length === 0 && !loading && (
            <p className="text-muted-foreground text-sm">
              Aucun boîtier trouvé
            </p>
          )}
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg animate-fade-in z-50"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Association/Dissociation Dialog */}
      <AssociateDeviceDialog
        open={selectedDeviceForDialog !== null}
        onOpenChange={handleDialogClose}
        device={selectedDeviceForDialog || { imei: '', isAssociated: false }}
        onSuccess={handleAssociationSuccess}
      />

      {/* Edit Device Dialog */}
      <EditDeviceDialog
        device={selectedDeviceForEdit}
        open={showEditDeviceDialog}
        onOpenChange={setShowEditDeviceDialog}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
