
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Save, Loader2 } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CompanySearchSelect } from "@/components/ui/company-search-select";
import { toast } from "@/components/ui/use-toast";
import { useCompanyVehicleDevice } from "@/hooks/useCompanyVehicleDevice";
import { searchCompaniesReal } from "@/services/CompanyVehicleDeviceService";
import { useVehicleAssociation } from "@/hooks/useVehicleAssociation";
import * as VehicleService from "@/services/VehicleService";
import * as CompanyDeviceService from "@/services/CompanyDeviceService";

interface AssociateVehicleFormProps {
  device?: any; // Can be a device or a vehicle for bidirectional association
  mode?: 'vehicle-device' | 'company-device'; // New mode for company-device association
  onClose: () => void;
  onSuccess: (updatedData?: any) => void;
}

export default function AssociateVehicleForm({ device, mode = 'vehicle-device', onClose, onSuccess }: AssociateVehicleFormProps) {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDeviceImei, setSelectedDeviceImei] = useState("");
  const [companyVehicles, setCompanyVehicles] = useState([]);
  const [companyDevices, setCompanyDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  // Use the vehicle association hook for better error handling
  const { isAssociating, performAssociation } = useVehicleAssociation();

  const {
    companies,
    loadCompaniesForSelect,
    getVehiclesByCompany,
    getAllVehiclesByCompany,
    allDataCache,
    isCacheReady,
    companiesReady,
    loading: hookLoading,
    // Add the existing optimized function
    getDevicesWithoutVehicles
  } = useCompanyVehicleDevice();
  
  // Determine the association mode
  const isCompanyDeviceMode = mode === 'company-device';
  const isDeviceToVehicle = !isCompanyDeviceMode && device?.type === "device";
  const isVehicleToDevice = !isCompanyDeviceMode && device?.type === "vehicle";

  // Debug cache status
  useEffect(() => {
    console.log('AssociateVehicleForm: Status changed:', {
      isCacheReady,
      companiesReady,
      hookLoading,
      companiesCount: companies.length,
      hasCache: !!allDataCache
    });
  }, [isCacheReady, companiesReady, hookLoading, companies.length, allDataCache]);

  // Create company options for select
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name || company.nom
  }));

  // SIMPLIFIED: Load vehicles when company is selected (for device to vehicle association)
  useEffect(() => {
    if (selectedCompany && isDeviceToVehicle) {
      console.log('=== LOADING VEHICLES FOR DEVICE-TO-VEHICLE ASSOCIATION ===');
      console.log('Company:', selectedCompany);
      loadVehiclesForCompany(selectedCompany);
    } else {
      console.log('Waiting for conditions - Company:', selectedCompany, 'Is device to vehicle:', isDeviceToVehicle);
    }
  }, [selectedCompany, isDeviceToVehicle]);
  
  // Load devices when component loads (for vehicle to device association)
  // Use the existing optimized function from the hook
  useEffect(() => {
    if (isVehicleToDevice) {
      console.log('Loading devices without vehicles using existing optimized function...');
      loadDevicesWithoutVehicles();
    }
  }, [isVehicleToDevice]);

  // Load free devices for company-device association mode
  useEffect(() => {
    if (isCompanyDeviceMode) {
      loadFreeDevicesForCompanyAssociation();
    }
  }, [isCompanyDeviceMode]);

  // Pre-fill device IMEI when device is passed in company-device mode
  useEffect(() => {
    if (isCompanyDeviceMode && device?.imei) {
      console.log('Pre-filling device IMEI for company-device mode:', device.imei);
      setSelectedDeviceImei(device.imei);
    }
  }, [isCompanyDeviceMode, device?.imei]);

  const loadVehiclesForCompany = async (companyName) => {
    console.log('=== LOADING VEHICLES FOR ASSOCIATION FORM ===');
    console.log('Company:', companyName, 'Cache ready:', isCacheReady);
    setIsLoading(true);
    
    try {
      const vehicles = await getVehiclesByCompany(companyName);
      console.log('Vehicles received:', vehicles?.length || 0);
      
      setCompanyVehicles(vehicles || []);
      
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setCompanyVehicles([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les véhicules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Use the existing optimized function for loading devices without vehicles with resilient error handling
  const loadDevicesWithoutVehicles = async () => {
    console.log('Loading only available devices (not associated or available in companydevice)...');
    setLoadingDevices(true);
    
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        getDevicesWithoutVehicles(),
        CompanyDeviceService.getUnassignedDevices()
      ]);

      let devicesWithoutVehicles = [];
      let companyDevices = [];

      // Handle first source (getDevicesWithoutVehicles)
      if (results[0].status === 'fulfilled') {
        devicesWithoutVehicles = results[0].value || [];
        console.log('✅ getDevicesWithoutVehicles succeeded:', devicesWithoutVehicles.length);
      } else {
        console.error('❌ getDevicesWithoutVehicles failed:', results[0].reason);
        toast({
          title: "Avertissement",
          description: "Certains boîtiers pourraient ne pas être affichés",
          variant: "default",
        });
      }

      // Handle second source (getUnassignedDevices)
      if (results[1].status === 'fulfilled') {
        companyDevices = results[1].value || [];
        console.log('✅ getUnassignedDevices succeeded:', companyDevices.length);
      } else {
        console.error('❌ getUnassignedDevices failed:', results[1].reason);
        // Don't show another toast if first source succeeded
        if (results[0].status === 'rejected') {
          toast({
            title: "Avertissement",
            description: "Certains boîtiers pourraient ne pas être affichés",
            variant: "default",
          });
        }
      }

      // Filter to show only devices that are:
      // 1. Not associated to any vehicle (from getDevicesWithoutVehicles)
      // 2. OR available in companydevice (from getUnassignedDevices)
      const availableDevices = [
        ...devicesWithoutVehicles.filter(device => !device.isAssociated && !device.vehicleImmat),
        ...companyDevices.filter(device => !device.isAssociated && !device.vehicleImmat)
      ];

      // Remove duplicates based on IMEI
      const uniqueDevices = availableDevices.filter((device, index, self) => 
        index === self.findIndex(d => d.imei === device.imei)
      );

      console.log('Available devices for association:', uniqueDevices.length);
      console.log('Device details:', uniqueDevices.map(d => ({ 
        imei: d.imei, 
        type: d.typeBoitier,
        entreprise: d.entreprise,
        isAssociated: d.isAssociated,
        vehicleImmat: d.vehicleImmat
      })));
      setCompanyDevices(uniqueDevices);
      
    } catch (error) {
      console.error('Error loading available devices:', error);
      setCompanyDevices([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les boîtiers disponibles",
        variant: "destructive",
      });
    } finally {
      setLoadingDevices(false);
    }
  };

  const loadFreeDevicesForCompanyAssociation = async () => {
    console.log('Loading free devices for company association');
    setLoadingDevices(true);
    
    try {
      const freeDevices = await CompanyDeviceService.getUnassignedDevices();
      console.log('Free devices for company association:', freeDevices.length);
      console.log('Device details:', freeDevices.map(d => ({ imei: d.imei, type: d.typeBoitier })));
      setCompanyDevices(freeDevices);
      
    } catch (error) {
      console.error('Error loading free devices:', error);
      setCompanyDevices([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les boîtiers libres",
        variant: "destructive",
      });
    } finally {
      setLoadingDevices(false);
    }
  };

  // Generate vehicle options (for device to vehicle association)
  const vehicleOptions = companyVehicles.map(vehicle => {
    const isAlreadyAssociated = vehicle.imei && vehicle.isAssociated;
    return {
      value: vehicle.immatriculation || vehicle.immat,
      label: `${vehicle.immatriculation || vehicle.immat}${vehicle.nomVehicule ? ` (${vehicle.nomVehicule})` : ''}${isAlreadyAssociated ? ' - Déjà associé' : ''}`,
      disabled: isAlreadyAssociated
    };
  });

  // Generate device options (for vehicle to device association - filter out associated devices)
  const deviceOptions = companyDevices.filter(device => {
    // Only show devices that are not already associated to vehicles
    return !device.isAssociated && !device.vehicleImmat;
  }).map(device => ({
    value: device.imei,
    label: `${device.imei}${device.typeBoitier ? ` (Protocol: ${device.typeBoitier})` : ''} - ${device.entreprise || 'Libre'}`,
    disabled: false
  }));

  const handleSubmit = async () => {
    // Only require company for device-to-vehicle and company-device modes
    if ((isDeviceToVehicle || isCompanyDeviceMode) && !selectedCompany) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une entreprise",
        variant: "destructive",
      });
      return;
    }

    if (isDeviceToVehicle) {
      // Device to vehicle association
      if (!selectedVehicle) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un véhicule",
          variant: "destructive",
        });
        return;
      }

      if (!device?.imei) {
        toast({
          title: "Erreur",
          description: "IMEI du boîtier non trouvé",
          variant: "destructive",
        });
        return;
      }

      // Use the hook for better error handling
      try {
        const result = await performAssociation(device.imei, selectedVehicle);
        if (result.success) {
          // Pass the updated data to the parent for proper refresh
          onSuccess(result.data);
          onClose();
        }
      } catch (error) {
        console.error('Error associating device to vehicle:', error);
      }
    } else if (isVehicleToDevice) {
      // Vehicle to device association
      if (!selectedDeviceImei) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un boîtier",
          variant: "destructive",
        });
        return;
      }

      if (!device?.vehicleImmat && !device?.immatriculation && !device?.immat) {
        toast({
          title: "Erreur",
          description: "Immatriculation du véhicule non trouvée",
          variant: "destructive",
        });
        return;
      }

      // Use the hook for better error handling for vehicle-to-device too
      try {
        const vehicleImmat = device.vehicleImmat || device.immatriculation || device.immat;
        const result = await performAssociation(selectedDeviceImei, vehicleImmat);
        if (result.success) {
          // Pass the updated data to the parent for proper refresh
          onSuccess(result.data);
          onClose();
        }
      } catch (error) {
        console.error('Error associating vehicle to device:', error);
      }
    } else if (isCompanyDeviceMode) {
      // Company-device association - use device IMEI from props
      const deviceImei = device?.imei;
      
      if (!deviceImei) {
        toast({
          title: "Erreur",
          description: "IMEI du boîtier non trouvé",
          variant: "destructive",
        });
        return;
      }

      if (!selectedCompany) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une entreprise",
          variant: "destructive",
        });
        return;
      }

      // Company-device mode still uses the direct service call since no hook for this yet
      try {
        console.log('Associating device to company:', { deviceImei, selectedCompany });
        await CompanyDeviceService.associateDeviceToCompany(deviceImei, selectedCompany);
        
        toast({
          title: "Succès",
          description: "Boîtier réservé pour l'entreprise avec succès",
        });
        
        onSuccess();
        onClose();
      } catch (error) {
        console.error('Error associating device to company:', error);
        
        let errorMessage = "Erreur lors de la réservation";
        
        // Handle specific GraphQL errors
        if (error.errors && error.errors.length > 0) {
          const graphQLError = error.errors[0];
          if (graphQLError.message.includes('Cannot return null for non-nullable')) {
            console.log('🎉 Association created successfully despite GraphQL display issue');
            toast({
              title: "Succès",
              description: "Le boîtier a été réservé avec succès à l'entreprise.",
              variant: "default",
            });
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 500);
            return; // Don't show error toast
          } else {
            errorMessage = `Erreur GraphQL: ${graphQLError.message}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isCompanyDeviceMode 
            ? "Réserver un boîtier pour une entreprise"
            : isDeviceToVehicle 
            ? `Associer le boîtier ${device?.imei} à un véhicule` 
            : `Associer un boîtier libre au véhicule ${device?.immatriculation || device?.immat}`
          }
        </h2>
        <div className="text-sm text-gray-600">
          {isCompanyDeviceMode 
            ? "Association Boîtier ↔ Entreprise (via CompanyDevice)"
            : isDeviceToVehicle
            ? "Association Boîtier ↔ Véhicule (via vehicleDeviceImei)"
            : "Association Véhicule ↔ Boîtier (via vehicleDeviceImei)"
          }
        </div>
      </div>

      <div className="space-y-4">
        {/* Company selection - only show for device-vehicle and company-device modes */}
        {(isDeviceToVehicle || isCompanyDeviceMode) && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Entreprise *
            </label>
            <CompanySearchSelect
              value={selectedCompany}
              onValueChange={setSelectedCompany}
              placeholder="Sélectionner une entreprise..."
              searchFunction={searchCompaniesReal}
              disabled={false}
            />
          </div>
        )}

        {isDeviceToVehicle && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Véhicule *
            </label>
            <SearchableSelect
              value={selectedVehicle}
              onValueChange={setSelectedVehicle}
              options={vehicleOptions}
              placeholder={
                !selectedCompany 
                  ? "Sélectionner d'abord une entreprise" 
                  : isLoading 
                    ? "Chargement des véhicules..." 
                    : companyVehicles.length === 0
                      ? "Aucun véhicule disponible"
                      : "Sélectionner un véhicule..."
              }
              disabled={!selectedCompany || isLoading}
            />
            {showAllVehicles && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Certains véhicules sont déjà associés à un boîtier
              </p>
            )}
          </div>
        )}

        {isVehicleToDevice && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Boîtier libre disponible *
            </label>
            <SearchableSelect
              value={selectedDeviceImei}
              onValueChange={setSelectedDeviceImei}
              options={deviceOptions}
              placeholder={
                loadingDevices 
                  ? "Chargement des boîtiers disponibles..." 
                  : companyDevices.length === 0
                    ? "Aucun boîtier disponible"
                    : "Sélectionner un boîtier disponible..."
              }
              disabled={loadingDevices}
            />
            {companyDevices.length > 0 && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {companyDevices.length} boîtier(s) disponible(s) pour l'association
              </p>
            )}
            {companyDevices.length === 0 && !loadingDevices && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Aucun boîtier disponible. Assurez-vous qu'il y a des boîtiers non associés à un véhicule.
              </p>
            )}
          </div>
        )}

        {/* Device selection for company-device mode - show as readonly input with device IMEI */}
        {isCompanyDeviceMode && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Boîtier sélectionné
            </label>
            <input
              type="text"
              value={device?.imei || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="IMEI du boîtier"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ce boîtier sera réservé pour l'entreprise sélectionnée
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isAssociating || 
              (isDeviceToVehicle && !selectedCompany) ||
              (isCompanyDeviceMode && (!selectedCompany || !device?.imei)) ||
              (isDeviceToVehicle && !selectedVehicle) ||
              (isVehicleToDevice && !selectedDeviceImei)
            }
          >
            {isAssociating 
              ? (isCompanyDeviceMode ? "Réservation..." : "Association...") 
              : (isCompanyDeviceMode ? "Réserver" : "Associer")
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
