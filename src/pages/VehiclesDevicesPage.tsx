import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet, Search, Edit, Link, Car, Wifi, Upload, Database, ArrowLeft, Smartphone, Building, X, RefreshCw } from "lucide-react";
import { EnhancedDataTable, Column } from "@/components/tables/EnhancedDataTable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AddVehicleForm from "@/components/forms/AddVehicleForm";
import ImportDevicesForm from "@/components/forms/ImportDevicesForm";
import AssociateVehicleForm from "@/components/forms/AssociateVehicleForm";
import AddDeviceWithVehicleForm from "@/components/forms/AddDeviceWithVehicleForm";
import { toast } from "@/hooks/use-toast";
import { MultipleImeiSearchDialog } from "@/components/dialogs/MultipleImeiSearchDialog";
import { DeleteConfirmationDialog } from "@/components/dialogs/DeleteConfirmationDialog";
import { useCompanyVehicleDevice } from "@/hooks/useCompanyVehicleDevice.jsx";
import { CompanySearchSelect } from "@/components/ui/company-search-select";
import { DevicesBulkAssociation } from "@/components/tables/DevicesBulkAssociation";
import { searchCompaniesReal } from "@/services/CompanyVehicleDeviceService";
import { createVehicleSimple, updateVehicleSimple } from "@/services/SimpleVehicleService";
import { dissociateVehicleFromDevice, deleteVehicleData } from "@/services/VehicleService";
import { associateDeviceToVehicle } from "@/services/DeviceAssociationService.js";
import { updateDeviceSimple } from "@/services/SimpleDeviceService.js";
import * as CompanyDeviceService from "@/services/CompanyDeviceService";
import { useDataRefresh } from "@/hooks/useDataRefresh";
import { clearOldCaches } from "@/utils/cache-utils";
import { CacheDebugPanel } from "@/components/debug/CacheDebugPanel";
import { ImeiDiagnosticPanel } from "@/components/debug/ImeiDiagnosticPanel";
export default function VehiclesDevicesPage() {
  const {
    companies,
    devices: combinedData,
    loading,
    isCacheReady,
    loadingMode,
    quickStats,
    loadAllData,
    loadQuickStats,
    setLoadingMode,
    searchDevices,
    searchByImei,
    searchBySim,
    searchByVehicle,
    searchByCompany,
    resetFilters,
    isFiltered,
    totalResults,
    // OPTIMIZED: New specialized functions
    getVehiclesWithoutDevices,
    getVehiclesWithEmptyImei,
    getDevicesWithoutVehicles,
    getUnassociatedItemsStats
  } = useCompanyVehicleDevice();

  // Local state for filtered data when using search
  const [filteredData, setFilteredData] = useState([]);

  // Dialog states
  const [showAssociateSheet, setShowAssociateSheet] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [associationMode, setAssociationMode] = useState<'vehicle-device' | 'company-device'>('vehicle-device');
  const [showMultipleImeiDialog, setShowMultipleImeiDialog] = useState(false);
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  const [showImportDevicesDialog, setShowImportDevicesDialog] = useState(false);
  const [showEditVehicleDialog, setShowEditVehicleDialog] = useState(false);
  const [showAddDeviceWithVehicleDialog, setShowAddDeviceWithVehicleDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Search states
  const [searchImei, setSearchImei] = useState('');
  const [searchImmat, setSearchImmat] = useState('');
  const [searchEntreprise, setSearchEntreprise] = useState('');
  const [searchVehiclesWithoutImei, setSearchVehiclesWithoutImei] = useState(false);

  // Multi-selection for dissociation
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Multi-selection for devices association
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [isDeviceSelectMode, setIsDeviceSelectMode] = useState(false);

  // Bulk association state
  const [showBulkAssociation, setShowBulkAssociation] = useState(false);

  // Track current filters for refresh after association
  const [currentFilters, setCurrentFilters] = useState({});

  // Data refresh hook
  const {
    refreshAfterAssociation,
    refreshAfterDissociation,
    refreshAfterDeletion
  } = useDataRefresh(loadAllData, setFilteredData, searchDevices, currentFilters);

  // OPTIMIZED: Search vehicles with empty IMEI with progressive display
  const searchVehiclesWithEmptyImeiOptimized = async () => {
    try {
      console.log('=== OPTIMIZED SEARCH: VEHICLES WITH EMPTY IMEI ===');
      setFilteredData([]); // Clear previous results
      setLoadingMode('search');

      // Progress callback to update results as they come in
      const onProgressUpdate = progressResults => {
        console.log(`Progress update: ${progressResults.length} vehicles so far`);
        setFilteredData([...progressResults]); // Update the display
      };
      const vehiclesWithEmptyImei = await getVehiclesWithEmptyImei(onProgressUpdate);
      setFilteredData(vehiclesWithEmptyImei); // Final update
    } catch (error) {
      console.error('Error searching vehicles with empty IMEI:', error);
    }
  };

  // OPTIMIZED: Search vehicles without devices - clear cache for fresh data
  const searchVehiclesWithoutDevicesOptimized = async () => {
    try {
      console.log('=== OPTIMIZED SEARCH: VEHICLES WITHOUT DEVICES ===');
      // Clear previous data and cache for fresh results
      setFilteredData([]);
      setCurrentFilters({});
      const vehiclesWithoutDevices = await getVehiclesWithoutDevices();
      setFilteredData(vehiclesWithoutDevices);
      setLoadingMode('search');
    } catch (error) {
      console.error('Error searching vehicles without devices:', error);
    }
  };

  // OPTIMIZED: Search devices without vehicles - clear cache for fresh data  
  const searchDevicesWithoutVehiclesOptimized = async () => {
    try {
      console.log('=== OPTIMIZED SEARCH: DEVICES WITHOUT VEHICLES ===');
      // Clear previous data and cache for fresh results
      setFilteredData([]);
      setCurrentFilters({});
      const devicesWithoutVehicles = await getDevicesWithoutVehicles();
      setFilteredData(devicesWithoutVehicles);
      setLoadingMode('search');
    } catch (error) {
      console.error('Error searching devices without vehicles:', error);
    }
  };

  // Search for company reserved devices
  const searchCompanyReservedDevices = async () => {
    try {
      console.log('=== SEARCH: COMPANY RESERVED DEVICES ===');
      const unassignedDevices = await CompanyDeviceService.getUnassignedDevices();
      // Filter for devices that are actually reserved by companies (future enhancement)
      const reservedDevices = unassignedDevices.filter(device => device.status === 'company_reserved');
      setFilteredData(reservedDevices);
      setLoadingMode('search');
    } catch (error) {
      console.error('Error searching company reserved devices:', error);
    }
  };

  // FALLBACK: Search vehicles without IMEI using cached data (for compatibility)
  const searchVehiclesWithoutImeiFunction = () => {
    console.log('=== FALLBACK SEARCH: VEHICLES WITHOUT IMEI (CACHED) ===');
    const vehiclesWithoutImei = combinedData.filter(item => item.type === "vehicle" && (!item.imei || item.imei === "") && (!item.vehicleDeviceImei || item.vehicleDeviceImei === ""));
    console.log('Vehicles without IMEI found:', vehiclesWithoutImei.length);
    setFilteredData(vehiclesWithoutImei);
    toast({
      title: "Recherche réussie",
      description: `${vehiclesWithoutImei.length} véhicule(s) sans IMEI trouvé(s)`
    });
  };

  // Search vehicles with filters
  const searchVehicles = async () => {
    if (searchVehiclesWithoutImei) {
      searchVehiclesWithoutImeiFunction();
      return;
    }
    if (!searchImei && !searchImmat && !searchEntreprise) {
      toast({
        title: "Attention",
        description: "Veuillez saisir au moins un critère de recherche",
        variant: "destructive"
      });
      return;
    }
    console.log('=== SEARCH INITIATED ===');
    console.log('Search criteria:', {
      searchImei,
      searchImmat,
      searchEntreprise
    });
    console.log('Available data in hook:', {
      combinedDataLength: combinedData.length,
      companiesLength: companies.length
    });
    try {
      // Determine search type based on how many criteria are filled
      const filledCriteria = [searchImei, searchImmat, searchEntreprise].filter(Boolean);
      let results;
      const isMultiImeiInput = (input: string) => {
        if (!input) return false;
        const parts = input.split(/[^0-9A-Za-z]+/).filter(Boolean);
        if (parts.length > 1) return true;
        const only = parts[0] || input;
        return /^\d+$/.test(only) && only.length >= 30 && only.length % 15 === 0;
      };
      if (filledCriteria.length === 1) {
        // Single criteria search - use specific functions with optimized caching
        if (searchImei) {
          if (isMultiImeiInput(searchImei)) {
            console.log('Multi-IMEI search detected, using combined filter');
            results = await searchDevices({
              imei: searchImei
            });
          } else {
            console.log('Single IMEI search for:', searchImei);
            results = await searchByImei(searchImei);
          }
        } else if (searchImmat) {
          console.log('Single vehicle search for:', searchImmat);
          results = await searchByVehicle(searchImmat);
        } else if (searchEntreprise) {
          console.log('Single company search for:', searchEntreprise);
          console.log('Company search term:', searchEntreprise);
          // The searchByCompany function will now use cached data automatically
          results = await searchByCompany(searchEntreprise);
        }
      } else {
        // Multiple criteria search - use combined search
        console.log('Multiple criteria search');
        results = await searchDevices({
          imei: searchImei,
          immatriculation: searchImmat,
          entreprise: searchEntreprise
        });
      }
      console.log('Search results received:', results?.length || 0);
      console.log('First 3 results:', results?.slice(0, 3).map(r => ({
        entreprise: r.entreprise,
        imei: r.imei,
        type: r.type,
        immatriculation: r.immatriculation
      })));
      setFilteredData(results || []);

      // Store current filters for refresh after operations
      setCurrentFilters({
        imei: searchImei,
        immatriculation: searchImmat,
        entreprise: searchEntreprise
      });
      if (!results || results.length === 0) {
        toast({
          title: "Aucun résultat",
          description: "Aucun véhicule ou boîtier trouvé avec ces critères",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Recherche réussie",
          description: `${results.length} résultat(s) trouvé(s)`
        });
      }
    } catch (error) {
      console.error("Error searching vehicles:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche",
        variant: "destructive"
      });
      setFilteredData([]);
    }
  };

  // Reset search
  const resetSearch = () => {
    setSearchImei('');
    setSearchImmat('');
    setSearchEntreprise('');
    setSearchVehiclesWithoutImei(false);
    setFilteredData([]);
    setCurrentFilters({});
    resetFilters();
  };

  // Refresh current search/filter
  const refreshCurrentView = async () => {
    try {
      if (Object.keys(currentFilters).length > 0) {
        // Refresh search results
        console.log('🔄 Refreshing current search with filters:', currentFilters);
        const results = await searchDevices(currentFilters);
        setFilteredData(results || []);
        toast({
          title: "Rafraîchi",
          description: `Données actualisées - ${results?.length || 0} résultat(s)`
        });
      } else if (filteredData.length > 0) {
        // Determine which type of specialized search is active and refresh it
        if (filteredData.every(item => item.type === 'vehicle' && !item.vehicleDeviceImei)) {
          console.log('🔄 Refreshing vehicles without devices');
          await searchVehiclesWithoutDevicesOptimized();
        } else if (filteredData.every(item => item.type === 'device' && !item.isAssociated)) {
          console.log('🔄 Refreshing devices without vehicles');
          await searchDevicesWithoutVehiclesOptimized();
        } else {
          console.log('🔄 Refreshing with load all data');
          await loadAllData('optimized');
        }
      } else {
        // Refresh all data
        console.log('🔄 Refreshing all data');
        await loadAllData('optimized');
      }
    } catch (error) {
      console.error('Error refreshing current view:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du rafraîchissement",
        variant: "destructive"
      });
    }
  };

  // Update or create vehicle - CORRECTED LOGIC
  const updateVehicleData = async data => {
    try {
      console.log('=== UPDATING/CREATING VEHICLE (CORRECTED) ===');
      console.log('Data received:', data);

      // Map entreprise to companyVehiclesId if needed
      const mappedData = {
        ...data
      };
      if (!mappedData.companyVehiclesId && data.entreprise) {
        const rawEntreprise = String(data.entreprise).trim();
        const looksLikeId = /[a-zA-Z0-9-]{8,}/.test(rawEntreprise);
        console.log('[VehiclesDevicesPage] Company resolution start:', {
          rawEntreprise,
          looksLikeId,
          companiesInCache: companies.length
        });

        // Try cache by id or name
        const byId = companies.find(c => c.id === rawEntreprise);
        const byName = !byId ? companies.find(c => c.name === rawEntreprise) : null;
        const found = byId || byName;
        if (found) {
          mappedData.companyVehiclesId = found.id;
          mappedData.entreprise = found.name;
          console.log('[VehiclesDevicesPage] Company resolved from cache:', {
            input: rawEntreprise,
            id: found.id,
            name: found.name
          });
        } else if (looksLikeId) {
          // Accept direct ID to handle eventual consistency
          mappedData.companyVehiclesId = rawEntreprise;
          console.log('[VehiclesDevicesPage] Company accepted as direct ID (no cache match).');
          // Optional non-blocking background lookup to resolve name
          try {
            const results = await searchCompaniesReal(rawEntreprise);
            const exact = Array.isArray(results) ? results.find(c => c.id === rawEntreprise) : null;
            if (exact?.name) mappedData.entreprise = exact.name;
            console.log('[VehiclesDevicesPage] Background lookup result:', {
              found: !!exact
            });
          } catch (e) {
            // ignore and proceed
          }
        } else {
          // Fallback to backend search (handles freshly created companies not yet in cache)
          try {
            const results = await searchCompaniesReal(rawEntreprise);
            const exact = Array.isArray(results) ? results.find(c => c.name?.toLowerCase() === rawEntreprise.toLowerCase()) : null;
            if (exact) {
              mappedData.companyVehiclesId = exact.id;
              mappedData.entreprise = exact.name;
              console.log('[VehiclesDevicesPage] Company resolved via backend search:', {
                input: rawEntreprise,
                id: exact.id,
                name: exact.name
              });
            } else {
              throw new Error(`Entreprise "${rawEntreprise}" non trouvée`);
            }
          } catch {
            // As last resort, accept ID-like input
            if (looksLikeId) {
              mappedData.companyVehiclesId = rawEntreprise;
              console.warn('[VehiclesDevicesPage] Backend search failed, accepting ID-like value for companyVehiclesId.');
            } else {
              throw new Error(`Entreprise "${rawEntreprise}" non trouvée`);
            }
          }
        }
      }

      // Use the corrected create or update function
      const {
        createOrUpdateVehicleSimple
      } = await import('../services/SimpleVehicleService.js');
      const updatedVehicle = await createOrUpdateVehicleSimple(mappedData);
      console.log('✅ Vehicle update result:', updatedVehicle);
      console.log('✅ Vehicle update result type:', typeof updatedVehicle);
      console.log('✅ Vehicle update result truthy:', !!updatedVehicle);

      // Optimized: Update local state instead of reloading all data
      if (updatedVehicle) {
        console.log('✅ Using optimized update: updating local state with modified vehicle');
        await refreshAfterAssociation("Véhicule traité avec succès", {
          ...updatedVehicle,
          type: "vehicle",
          isAssociated: !!updatedVehicle.vehicleDeviceImei
        });
      } else {
        console.log('❌ No updated vehicle returned, falling back to full reload');
        // Fallback toast and reload only if update failed
        toast({
          title: "Succès",
          description: "Véhicule traité avec succès"
        });
        await loadAllData();
      }
    } catch (err) {
      console.error('Error updating/creating vehicle:', err);
      toast({
        title: "Erreur",
        description: `Erreur lors du traitement: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  // Delete vehicle
  const deleteVehicleDataLocal = async item => {
    try {
      await deleteVehicleData(item);
      await refreshAfterDeletion("Véhicule supprimé avec succès");
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  // Dissociate device from vehicle
  const dissociateDevice = async item => {
    console.log('=== STARTING DISSOCIATION ===');
    console.log('Item to dissociate:', item);
    try {
      if (item.type === 'vehicle') {
        console.log('Dissociating vehicle with immat:', item.immatriculation || item.immat);
        const result = await dissociateVehicleFromDevice(item.immatriculation || item.immat);
        console.log('Dissociation result:', result);
        await refreshAfterDissociation("Boîtier dissocié du véhicule avec succès", {
          ...item,
          imei: '',
          vehicleDeviceImei: null,
          device: null,
          isAssociated: false,
          type: 'vehicle'
        });
        await refreshCurrentView();
      } else if (item.type === 'device') {
        // Import device dissociation service from DeviceUniqueAssociationService
        const {
          dissociateDeviceFromVehicle
        } = await import('../services/DeviceUniqueAssociationService.js');
        console.log('Dissociating device with IMEI:', item.imei);
        const result = await dissociateDeviceFromVehicle(item.imei);
        console.log('Dissociation result:', result);
        await refreshAfterDissociation("Véhicule dissocié du boîtier avec succès", {
          ...item,
          vehicleImmat: null,
          isAssociated: false,
          entreprise: 'Boîtier libre',
          type: 'device'
        });
        await refreshCurrentView();
      }
      console.log('Dissociation completed successfully');
    } catch (err) {
      console.error('=== DISSOCIATION ERROR ===');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      if (err.errors) {
        console.error('GraphQL errors:', err.errors);
      }
      toast({
        title: "Erreur",
        description: `Erreur lors de la dissociation: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  // Bulk dissociate selected vehicles
  const bulkDissociateSelected = async () => {
    if (selectedVehicles.length === 0) return;
    console.log('=== BULK DISSOCIATING DEVICES FROM VEHICLES ===');
    console.log('Vehicle immats:', selectedVehicles);
    try {
      const results = [];
      const errors = [];
      for (const immat of selectedVehicles) {
        try {
          await dissociateVehicleFromDevice(immat);
          results.push({
            immat,
            success: true
          });
        } catch (error) {
          console.error(`Error dissociating ${immat}:`, error);
          errors.push({
            immat,
            error: error.message
          });
        }
      }
      console.log('Bulk dissociation completed:', {
        successful: results.length,
        failed: errors.length
      });
      if (errors.length === 0) {
        toast({
          title: "Succès",
          description: `${results.length} véhicule(s) dissocié(s) avec succès`
        });
      } else {
        toast({
          title: "Partiellement réussi",
          description: `${results.length} réussi(s), ${errors.length} échec(s)`,
          variant: "default"
        });
      }
      setSelectedVehicles([]);
      setIsSelectMode(false);
      await refreshAfterDissociation(`${results.length} véhicule(s) dissocié(s) avec succès`);
    } catch (err) {
      console.error('Error bulk dissociating:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la dissociation multiple",
        variant: "destructive"
      });
    }
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    const newSelectMode = !isSelectMode;
    setIsSelectMode(newSelectMode);
    setSelectedVehicles([]);

    // If turning on vehicle select mode, turn off device select mode
    if (newSelectMode && isDeviceSelectMode) {
      setIsDeviceSelectMode(false);
      setSelectedDevices([]);
    }
  };

  // Toggle device select mode
  const toggleDeviceSelectMode = () => {
    const newDeviceSelectMode = !isDeviceSelectMode;
    setIsDeviceSelectMode(newDeviceSelectMode);
    setSelectedDevices([]);

    // If turning on device select mode, turn off vehicle select mode
    if (newDeviceSelectMode && isSelectMode) {
      setIsSelectMode(false);
      setSelectedVehicles([]);
    }
  };

  // Get available devices for selection (only unassociated devices)
  const getAvailableDevices = () => {
    const currentData = filteredData.length > 0 ? filteredData : combinedData;
    return currentData.filter(item => item.type === "device" && item.imei && !item.isAssociated);
  };

  // Handle device selection
  const handleDeviceSelect = (imei, isSelected) => {
    if (isSelected) {
      // Prevent duplicates
      setSelectedDevices(prev => prev.includes(imei) ? prev : [...prev, imei]);
    } else {
      setSelectedDevices(prev => prev.filter(id => id !== imei));
    }
  };

  // Select all available devices
  const selectAllDevices = () => {
    const availableDevices = getAvailableDevices();
    setSelectedDevices(availableDevices.map(device => device.imei));
  };

  // Deselect all devices
  const deselectAllDevices = () => {
    setSelectedDevices([]);
  };

  // Handle bulk association of selected devices
  const handleBulkAssociateDevices = () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un boîtier",
        variant: "destructive"
      });
      return;
    }
    const devicesData = selectedDevices.map(imei => filteredData.find(item => item.imei === imei) || combinedData.find(item => item.imei === imei)).filter(Boolean);
    console.log('=== BULK ASSOCIATION: SELECTED DEVICES ===');
    console.log('Selected IMEIs:', selectedDevices);
    console.log('Devices data for association:', devicesData);
    setShowBulkAssociation(true);
    // Stocker les données des devices sélectionnés pour l'association
    setFilteredData(devicesData);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (immat, isSelected) => {
    if (isSelected) {
      // Prevent duplicates
      setSelectedVehicles(prev => prev.includes(immat) ? prev : [...prev, immat]);
    } else {
      setSelectedVehicles(prev => prev.filter(id => id !== immat));
    }
  };

  // Define columns for the table with enhanced device information
  const allColumns = [...(isSelectMode ? [{
    id: "select",
    label: "Sélection",
    sortable: false,
    visible: true,
    renderCell: (value, row) => {
      // Only show checkbox for vehicles with associated devices
      if (row.type === "vehicle" && row.imei && row.isAssociated) {
        const isSelected = selectedVehicles.includes(row.immatriculation || row.immat);
        return <div className="flex justify-center">
            <input type="checkbox" checked={isSelected} onChange={e => handleVehicleSelect(row.immatriculation || row.immat, e.target.checked)} className="h-4 w-4 accent-blue-600 cursor-pointer" />
          </div>;
      }
      return null;
    }
  }] : []), ...(isDeviceSelectMode ? [{
    id: "deviceSelect",
    label: "Sélection Boîtiers",
    sortable: false,
    visible: true,
    renderCell: (value, row) => {
      // Only show checkbox for unassociated devices (available for association)
      if (row.type === "device" && row.imei && !row.isAssociated) {
        const isSelected = selectedDevices.includes(row.imei);
        return <div className="flex justify-center">
            <input type="checkbox" checked={isSelected} onChange={e => handleDeviceSelect(row.imei, e.target.checked)} className="h-4 w-4 accent-green-600 cursor-pointer" />
          </div>;
      }
      return null;
    }
  }] : []), {
    id: "imei",
    label: "IMEI",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className={!value ? "text-gray-400 italic" : "text-gray-900"}>
          {value || "Non assigné"}
        </span>
  }, {
    id: "immatriculation",
    label: "Immatriculation",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <div className="flex items-center gap-2">
          {row.type === "vehicle" ? <Car className="h-4 w-4 text-blue-500" /> : <Wifi className="h-4 w-4 text-green-500" />}
          <div className="flex flex-col">
            <span className={!value ? "text-gray-400 italic" : "font-medium"}>
              {value || (row.type === "vehicle" ? "Pas d'immatriculation" : "Boîtier non assigné")}
            </span>
            {row.type === "vehicle" && row.nomVehicule && <span className="text-xs text-gray-500">{row.nomVehicule}</span>}
          </div>
        </div>
  }, {
    id: "entreprise",
    label: "Entreprise actuelle",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <div className="flex flex-col">
          <span className={row.type === "vehicle" ? "text-blue-600 font-medium" : row.isAssociated ? "text-gray-900" : "text-green-600 font-medium"}>
            {value || "Entreprise non définie"}
          </span>
          {row.type === "device" && <span className="text-xs text-gray-500">
              {row.isAssociated ? "Boîtier assigné" : "Boîtier disponible"}
            </span>}
        </div>
  }, {
    id: "nomVehicule",
    label: "Nom Véhicule",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className={!value ? "text-gray-400 italic" : "text-gray-900"}>
        {value || "Nom non défini"}
      </span>
  }, {
    id: "typeBoitier",
    label: "Protocol",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <div className="flex flex-col">
          <span className="font-medium">
            {value || "Aucun protocole"}
          </span>
          {row.deviceData && <span className="text-xs text-gray-500">
              {row.isAssociated ? "Associé" : "Disponible"}
            </span>}
        </div>
  }, {
    id: "emplacement",
    label: "Emplacement",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Non défini"}
        </span>
  }, {
    id: "marque",
    label: "Marque",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Non définie"}
        </span>
  }, {
    id: "modele",
    label: "Modèle",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Non défini"}
        </span>
  }, {
    id: "kilometrage",
    label: "Kilométrage",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? `${value} km` : "Non défini"}
        </span>
  }, {
    id: "sim",
    label: "SIM",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className={row.sim || row.telephone ? "text-gray-900" : "text-gray-400"}>
          {row.sim || row.telephone || "Pas de SIM"}
        </span>
  }, {
    id: "iccid",
    label: "ICCID",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className={value ? "text-gray-900 font-mono text-sm" : "text-gray-400"}>
          {value || "Pas d'ICCID"}
        </span>
  }, {
    id: "telephone",
    label: "Téléphone",
    sortable: true,
    visible: false,
    renderCell: value => <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Pas de téléphone"}
        </span>
  }, {
    id: "statut",
    label: "Statut",
    sortable: true,
    visible: true,
    renderCell: (value, row) => {
      // Determine device status based on type and associations
      let status = "Inconnu";
      let badgeClass = "bg-gray-100 text-gray-800";
      if (row.type === "device") {
        // For devices, determine status based on company association and vehicle association
        if (!row.isAssociated && row.entreprise === "Boîtier libre" && !row.isReservedForCompany) {
          status = "Libre";
          badgeClass = "bg-green-100 text-green-800";
        } else if (row.isAssociated && row.immatriculation) {
          status = "Associé véhicule";
          badgeClass = "bg-blue-100 text-blue-800";
        } else if (row.isReservedForCompany || row.entreprise && row.entreprise !== "Boîtier libre") {
          status = "Réservé client";
          badgeClass = "bg-orange-100 text-orange-800";
        }
      } else if (row.type === "vehicle") {
        // For vehicles, show association status
        if (row.imei && row.isAssociated) {
          status = "Avec boîtier";
          badgeClass = "bg-blue-100 text-blue-800";
        } else {
          status = "Sans boîtier";
          badgeClass = "bg-gray-100 text-gray-800";
        }
      }
      return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
            {status}
          </span>;
    }
  }];

  // Define columns specifically for vehicles without devices view
  const vehicleWithoutDeviceColumns = [{
    id: "immatriculation",
    label: "Immatriculation",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium">
              {value || "Pas d'immatriculation"}
            </span>
            {row.nomVehicule && <span className="text-xs text-gray-500">{row.nomVehicule}</span>}
          </div>
        </div>
  }, {
    id: "imei",
    label: "IMEI",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className="text-gray-400 italic">
          Non assigné
        </span>
  }, {
    id: "typeBoitier",
    label: "Protocol",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className="text-gray-400 italic">
          Aucun protocole
        </span>
  }, {
    id: "sim",
    label: "SIM",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className="text-gray-400 italic">
          Pas de SIM
        </span>
  }, {
    id: "entreprise",
    label: "Entreprise actuelle",
    sortable: true,
    visible: true,
    renderCell: (value, row) => <span className="text-blue-600 font-medium">
          {value || "Entreprise non définie"}
        </span>
  }];

  // Function to determine which columns to use based on current view
  const getColumnsForCurrentView = () => {
    // Check if we're showing vehicles without devices (filteredData contains vehicles with no IMEI)
    const hasVehiclesWithoutDevices = filteredData.length > 0 && filteredData.some(item => item.type === "vehicle" && (!item.imei || item.imei === ""));
    if (hasVehiclesWithoutDevices && filteredData.every(item => item.type === "vehicle")) {
      return vehicleWithoutDeviceColumns;
    }
    return allColumns;
  };

  // Handle delete function
  const handleDelete = async item => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le véhicule "${item.immatriculation || item.immat}" ?`)) {
      return;
    }
    try {
      await deleteVehicleData(item);
      toast({
        title: "Succès",
        description: "Véhicule supprimé avec succès"
      });
      // Refresh the current view
      if (loadingMode === 'search') {
        searchVehiclesWithoutDevicesOptimized();
      } else {
        loadAllData();
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du véhicule",
        variant: "destructive"
      });
    }
  };
  const handleEdit = item => {
    setSelectedItem(item);
    setShowEditVehicleDialog(true);
  };
  const handleAssociate = item => {
    console.log('=== HANDLE ASSOCIATE ===');
    console.log('Item to associate:', item);

    // Can associate either a device to a vehicle or a vehicle to a device
    if (item.type === "device") {
      console.log('Associating device to vehicle mode');
      setSelectedDevice(item);
    } else {
      console.log('Associating vehicle to device mode');
      // For vehicle, create a device-like object for the form
      setSelectedDevice({
        ...item,
        type: "vehicle",
        vehicleImmat: item.immatriculation || item.immat
      });
    }
    setAssociationMode('vehicle-device');
    setShowAssociateSheet(true);
  };
  const handleCompanyDeviceAssociation = () => {
    setSelectedDevice(null);
    setAssociationMode('company-device');
    setShowAssociateSheet(true);
  };
  const handleSaveEdit = async updatedItem => {
    try {
      const prevImei = selectedItem?.imei || selectedItem?.vehicleDeviceImei || '';
      const immat = updatedItem.immatriculation || updatedItem.immat || selectedItem?.immatriculation || selectedItem?.immat;
      const desiredImei = String(updatedItem.desiredVehicleDeviceImei || '').trim();
      const associationChange = updatedItem.associationChange;
      const deviceUpdates = updatedItem.deviceUpdates || {};

      // 1) Orchestration association/dissociation
      if (associationChange === 'dissociate' || !desiredImei && prevImei) {
        await dissociateVehicleFromDevice(immat);
        toast({
          title: 'Succès',
          description: 'Boîtier dissocié du véhicule avec succès'
        });
        await refreshAfterDissociation('Boîtier dissocié du véhicule avec succès', {
          ...selectedItem,
          imei: '',
          vehicleDeviceImei: null,
          device: null,
          isAssociated: false,
          type: 'vehicle'
        });
      } else if (associationChange === 'associate' && desiredImei) {
        await associateDeviceToVehicle(desiredImei, immat);
        toast({
          title: 'Succès',
          description: `Boîtier ${desiredImei} associé au véhicule ${immat}`
        });
        if (deviceUpdates && (deviceUpdates.sim || deviceUpdates.protocolId !== undefined)) {
          await updateDeviceSimple({
            imei: desiredImei,
            ...deviceUpdates
          });
          toast({
            title: 'Boîtier mis à jour',
            description: 'Informations du boîtier mises à jour'
          });
        }
      } else if (associationChange === 'none' && prevImei && deviceUpdates && (deviceUpdates.sim || deviceUpdates.protocolId !== undefined)) {
        await updateDeviceSimple({
          imei: prevImei,
          ...deviceUpdates
        });
        toast({
          title: 'Boîtier mis à jour',
          description: 'Informations du boîtier mises à jour'
        });
      }

      // 2) Mise à jour des champs véhicule (sans les champs spéciaux)
      const {
        desiredVehicleDeviceImei,
        associationChange: _ac,
        deviceUpdates: _du,
        ...vehicleFields
      } = updatedItem;
      await updateVehicleData(vehicleFields);
    } catch (error) {
      console.error('Error saving vehicle edit:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la mise à jour',
        variant: 'destructive'
      });
    } finally {
      setShowEditVehicleDialog(false);
      setSelectedItem(null);
    }
  };
  // Initial view component
  const InitialView = () => <div className="space-y-8 p-8 text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Véhicules & Dispositifs</h1>
        <p className="text-muted-foreground">Choisissez une action pour commencer</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Button onClick={() => searchVehiclesWithEmptyImeiOptimized()} variant="outline" className="h-20 text-left flex flex-col items-start justify-center p-4" disabled={loading}>
          <Car className="h-6 w-6 mb-2" />
          <div>
            <div className="font-medium">Véhicules sans IMEI</div>
            <div className="text-sm text-muted-foreground">Voir les véhicules avec IMEI vide</div>
          </div>
        </Button>

        <Button onClick={() => {
        searchDevicesWithoutVehiclesOptimized();
        setShowBulkAssociation(true);
      }} variant="outline" className="h-20 text-left flex flex-col items-start justify-center p-4" disabled={loading}>
          <Smartphone className="h-6 w-6 mb-2" />
          <div>
            <div className="font-medium">Devices sans IMEI</div>
            <div className="text-sm text-muted-foreground">Voir et associer en masse</div>
          </div>
        </Button>

        

        <Button onClick={() => loadAllData('optimized')} variant="outline" className="h-20 text-left flex flex-col items-start justify-center p-4" disabled={loading}>
          <Database className="h-6 w-6 mb-2" />
          <div>
            <div className="font-medium">Charger tout (Optimisé)</div>
            <div className="text-sm text-muted-foreground">Nouvelle requête optimisée</div>
          </div>
        </Button>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={() => setShowAddVehicleDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter Véhicule
        </Button>
        <Button variant="default" onClick={() => setShowAddDeviceWithVehicleDialog(true)}>
          <Car className="mr-2 h-4 w-4" />
          Créer Device + Véhicule
        </Button>
        <Button variant="outline" onClick={() => setShowImportDevicesDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Importer Devices
        </Button>
      </div>
    </div>;
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>;
  }

  // Show initial view when no specific mode is active
  if (loadingMode === 'initial' || !loadingMode) {
    return <div className="space-y-6">
        <InitialView />
        
        {/* Modals must be available in all views */}
        <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un Véhicule</DialogTitle>
              <DialogDescription>
                Créez un nouveau véhicule sans boîtier associé.
              </DialogDescription>
            </DialogHeader>
            <AddVehicleForm onClose={() => setShowAddVehicleDialog(false)} onSave={async data => {
            await updateVehicleData(data);
            setShowAddVehicleDialog(false);
            loadQuickStats();
          }} />
          </DialogContent>
        </Dialog>

        <Dialog open={showImportDevicesDialog} onOpenChange={setShowImportDevicesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Importer des Boîtiers</DialogTitle>
              <DialogDescription>
                Importez des boîtiers depuis un fichier Excel ou CSV.
              </DialogDescription>
            </DialogHeader>
            <ImportDevicesForm onClose={() => {
            setShowImportDevicesDialog(false);
            loadQuickStats();
          }} />
          </DialogContent>
        </Dialog>

        <Dialog open={showAddDeviceWithVehicleDialog} onOpenChange={setShowAddDeviceWithVehicleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer Device + Véhicule + Association</DialogTitle>
              <DialogDescription>
                Créez un nouveau boîtier et un véhicule, puis associez-les automatiquement.
              </DialogDescription>
            </DialogHeader>
            <AddDeviceWithVehicleForm onClose={() => {
            setShowAddDeviceWithVehicleDialog(false);
            loadQuickStats();
          }} onSuccess={async () => {
            setShowAddDeviceWithVehicleDialog(false);
            await refreshAfterAssociation("Device et véhicule créés et associés");
          }} />
          </DialogContent>
        </Dialog>
      </div>;
  }
  console.log('=== RENDERING TABLE VIEW ===');
  console.log('loadingMode:', loadingMode);
  console.log('Should render add buttons in table view');
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Véhicules & Dispositifs</h1>
          <Button variant="ghost" size="sm" onClick={() => {
          clearOldCaches();
          setFilteredData([]);
          setCurrentFilters({});
          setShowBulkAssociation(false);
          setLoadingMode('initial');
        }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button variant="outline" size="sm" onClick={refreshCurrentView} disabled={loading} title="Rafraîchir la vue actuelle">
            <RefreshCw className="mr-2 h-4 w-4" />
          </Button>
        </div>
        
        {/* Debug Panels - Temporary for IMEI search issues */}
        
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={refreshCurrentView} disabled={loading} title="Rafraîchir la vue actuelle">
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddVehicleDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Véhicule
          </Button>
          <Button variant="default" onClick={() => setShowAddDeviceWithVehicleDialog(true)}>
            <Car className="mr-2 h-4 w-4" />
            Créer Device + Véhicule
          </Button>
          <Button variant="outline" onClick={() => setShowImportDevicesDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importer Devices
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      

      {/* OPTIMIZED: Specialized Filter Buttons - Direct API calls without cache loading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">🚗 Véhicules sans boîtiers</h3>
          <p className="text-xs text-gray-600 mb-3">Recherche optimisée - Chargement direct sans cache</p>
          <Button variant="outline" onClick={searchVehiclesWithoutDevicesOptimized} className="w-full bg-blue-50 border-blue-300 hover:bg-blue-100" disabled={loading}>
            <Car className="h-4 w-4 mr-2" />
            Véhicules sans boîtier
          </Button>
        </div>
        
        <div className="text-center">
          <h3 className="text-sm font-semibold text-green-700 mb-2">📡 Boîtiers libres</h3>
          <p className="text-xs text-gray-600 mb-3">Recherche optimisée - Chargement direct sans cache</p>
          <Button variant="outline" onClick={() => {
          searchDevicesWithoutVehiclesOptimized();
          setShowBulkAssociation(true);
        }} className="w-full bg-green-50 border-green-300 hover:bg-green-100" disabled={loading}>
            <Wifi className="h-4 w-4 mr-2" />
            Devices sans véhicules
          </Button>
        </div>

        <div className="text-center">
          <h3 className="text-sm font-semibold text-purple-700 mb-2">📊 Charger tout</h3>
          <p className="text-xs text-gray-600 mb-3">Rechargement complet des données</p>
          <Button variant="outline" onClick={() => {
          // Clear current filters and load all data
          setFilteredData([]);
          setCurrentFilters({});
          loadAllData('optimized');
        }} className="w-full bg-purple-50 border-purple-300 hover:bg-purple-100" disabled={loading}>
            <Database className="h-4 w-4 mr-2" />
            Charger tout
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Véhicules & Boîtiers</h1>
          <p className="text-sm text-gray-600 mt-1">
            {combinedData.filter(item => item.type === "vehicle").length} véhicules • {" "}
            {combinedData.filter(item => item.type === "device" && item.isAssociated).length} boîtiers assignés • {" "}
            {combinedData.filter(item => item.type === "device" && !item.isAssociated).length} boîtiers disponibles
          </p>
          
          {/* Multi-select controls */}
          {isSelectMode && <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700 font-medium">
                Mode sélection véhicules: {selectedVehicles.length} véhicule(s) sélectionné(s)
              </span>
              {selectedVehicles.length > 0 && <Button size="sm" variant="destructive" onClick={bulkDissociateSelected}>
                  Dissocier la sélection ({selectedVehicles.length})
                </Button>}
              <Button size="sm" variant="outline" onClick={toggleSelectMode}>
                Annuler
              </Button>
            </div>}
            
          {/* Multi-select controls for devices */}
          {isDeviceSelectMode}
        </div>
        
        {/* Action buttons - Always visible and prominent */}
      </div>
      
      {/* Interface d'association en masse pour boîtiers sélectionnés */}
      {showBulkAssociation && filteredData.length > 0 && <div className="mb-6">
          <DevicesBulkAssociation devices={filteredData.filter(device => device.type === "device")} onAssociationComplete={async () => {
        // Fermer l'interface d'association
        setShowBulkAssociation(false);
        // Réinitialiser les sélections
        setSelectedDevices([]);
        setIsDeviceSelectMode(false);
        // Rafraîchir les données de façon standardisée
        await refreshAfterAssociation("Boîtiers associés avec succès");
      }} />
        </div>}

      {/* Table pour les vues spécialisées */}
      {(() => {
      if (showBulkAssociation) return null;
      const dataToShow = filteredData.length > 0 ? filteredData : combinedData;
      console.log('=== TABLE DISPLAY DEBUG ===');
      console.log('filteredData.length:', filteredData.length);
      console.log('combinedData.length:', combinedData.length);
      console.log('dataToShow.length:', dataToShow.length);
      console.log('loadingMode:', loadingMode);
      console.log('loading:', loading);
      console.log('Should show table:', dataToShow.length > 0);
      return dataToShow.length > 0 ? <EnhancedDataTable columns={getColumnsForCurrentView()} data={dataToShow} onEdit={handleEdit} onAssociate={handleAssociate} onDissociate={dissociateDevice} loading={loading} enablePagination={true} selectedVehicles={selectedVehicles} selectedDevices={selectedDevices} isSelectMode={isSelectMode} isDeviceSelectMode={isDeviceSelectMode} /> : <div className="text-center py-8 text-muted-foreground">
          Aucune donnée à afficher. Chargement en cours...
        </div>;
    })()}

      {/* Keep existing dialogs and sheets */}
      <Sheet open={showAssociateSheet} onOpenChange={setShowAssociateSheet}>
        <SheetContent>
          <SheetHeader className="mb-5">
            <SheetTitle>Associer un Véhicule</SheetTitle>
          </SheetHeader>
          <AssociateVehicleForm device={selectedDevice} mode={associationMode} onClose={() => setShowAssociateSheet(false)} onSuccess={async updatedData => {
          const successMessage = associationMode === 'company-device' ? "Le boîtier a été réservé pour l'entreprise avec succès" : "Le boîtier a été associé au véhicule avec succès";
          setShowAssociateSheet(false);
          setAssociationMode('vehicle-device');

          // Use refresh hook with updated data for proper table update
          await refreshAfterAssociation(successMessage, updatedData);
        }} />
        </SheetContent>
      </Sheet>

      <MultipleImeiSearchDialog open={showMultipleImeiDialog} onOpenChange={setShowMultipleImeiDialog} data={combinedData} onUpdate={async (devices, newCompany) => {
      toast({
        description: `${devices.length} boîtier(s) modifié(s) avec succès`
      });
      setShowMultipleImeiDialog(false);
      await refreshAfterAssociation("Boîtiers mis à jour");
    }} />

      <Dialog open={showEditVehicleDialog} onOpenChange={setShowEditVehicleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === "vehicle" ? "Modifier le véhicule" : "Modifier le boîtier"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.type === "vehicle" ? "Modifiez les informations du véhicule sélectionné." : "Modifiez les informations du boîtier sélectionné."}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && <AddVehicleForm initialData={selectedItem} onClose={() => setShowEditVehicleDialog(false)} onSave={handleSaveEdit} isEditing={true} />}
        </DialogContent>
      </Dialog>

      {/* Dialogs - Available in all views */}
      <Dialog open={showAddVehicleDialog} onOpenChange={open => {
      console.log('Dialog state changing:', open);
      setShowAddVehicleDialog(open);
    }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un Véhicule</DialogTitle>
            <DialogDescription>
              Créez un nouveau véhicule sans boîtier associé.
            </DialogDescription>
          </DialogHeader>
          <AddVehicleForm onClose={() => setShowAddVehicleDialog(false)} onSave={async data => {
          await updateVehicleData(data);
          setShowAddVehicleDialog(false);
          loadQuickStats();
        }} />
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDevicesDialog} onOpenChange={setShowImportDevicesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importer des Boîtiers</DialogTitle>
            <DialogDescription>
              Importez des boîtiers depuis un fichier Excel ou CSV.
            </DialogDescription>
          </DialogHeader>
          <ImportDevicesForm onClose={() => {
          setShowImportDevicesDialog(false);
          loadQuickStats();
        }} />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDeviceWithVehicleDialog} onOpenChange={open => {
      console.log('Device+Vehicle Dialog state changing:', open);
      setShowAddDeviceWithVehicleDialog(open);
    }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer Device + Véhicule + Association</DialogTitle>
            <DialogDescription>
              Créez un nouveau boîtier et un véhicule, puis associez-les automatiquement.
            </DialogDescription>
          </DialogHeader>
          <AddDeviceWithVehicleForm onClose={() => {
          setShowAddDeviceWithVehicleDialog(false);
          loadQuickStats();
        }} onSuccess={async () => {
          setShowAddDeviceWithVehicleDialog(false);
          await refreshAfterAssociation("Device et véhicule créés et associés");
        }} />
        </DialogContent>
      </Dialog>
    </div>;
}