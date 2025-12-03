import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CompanySearchSelect } from '@/components/ui/company-search-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { toast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { associateDeviceToVehicleUnique } from '@/services/DeviceUniqueAssociationService';
import { getGraphQLClient } from '@/config/aws-config';
import { vehiclesByCompanyVehiclesId } from '@/graphql/queries';
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

interface AssociateDeviceFormProps {
  deviceImei: string;
  onSuccess: (updatedDevice?: any) => void;
  onClose: () => void;
}

export default function AssociateDeviceForm({ deviceImei, onSuccess, onClose }: AssociateDeviceFormProps) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [companyVehicles, setCompanyVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [conflictingVehicle, setConflictingVehicle] = useState<any>(null);

  // Convert vehicles to searchable options
  const vehicleOptions = useMemo(() => {
    return companyVehicles.map((vehicle) => {
      const hasDevice = vehicle.device?.imei || vehicle.vehicleDeviceImei;
      const linkedImei = vehicle.device?.imei || vehicle.vehicleDeviceImei;
      
      let label = vehicle.immat;
      if (vehicle.nomVehicule) {
        label += ` (${vehicle.nomVehicule})`;
      }
      if (hasDevice) {
        label += ` [🔗 ${linkedImei}]`;
      }
      
      return {
        value: vehicle.immat,
        label,
      };
    });
  }, [companyVehicles]);

  // Load vehicles when company is selected
  useEffect(() => {
    const loadVehicles = async () => {
      if (selectedCompany) {
        setLoadingVehicles(true);
        setSelectedVehicle('');
        
        try {
          const client = await getGraphQLClient();
          const response = await client.graphql({
            query: vehiclesByCompanyVehiclesId,
            variables: {
              companyVehiclesId: selectedCompany,
              limit: 10000
            }
          }) as any;
          
          const vehicles = response.data?.vehiclesByCompanyVehiclesId?.items || [];
          setCompanyVehicles(vehicles);
        } catch (error) {
          console.error('Error loading vehicles:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les véhicules",
            variant: "destructive",
          });
          setCompanyVehicles([]);
        } finally {
          setLoadingVehicles(false);
        }
      } else {
        setCompanyVehicles([]);
      }
    };
    
    loadVehicles();
  }, [selectedCompany]);

  const handleVehicleSelect = (immat: string) => {
    setSelectedVehicle(immat);
  };

  const handleSubmit = async (forceAssociation = false) => {
    if (!selectedVehicle) {
      toast({
        title: "Véhicule requis",
        description: "Veuillez sélectionner un véhicule",
        variant: "destructive",
      });
      return;
    }

    // Check if vehicle already has a device before submitting
    if (!forceAssociation) {
      const vehicle = companyVehicles.find(v => v.immat === selectedVehicle);
      if (vehicle?.device?.imei || vehicle?.vehicleDeviceImei) {
        setConflictingVehicle(vehicle);
        setShowConfirmation(true);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Use the unique association service with force parameter
      const result = await associateDeviceToVehicleUnique(
        deviceImei,
        selectedVehicle,
        forceAssociation
      );

      if (result.success) {
        toast({
          title: "Association réussie",
          description: `Boîtier ${deviceImei} associé au véhicule ${selectedVehicle}`,
        });
        
        // Get the vehicle details to return complete updated device info
        const vehicle = companyVehicles.find(v => v.immat === selectedVehicle);
        const updatedDevice = {
          imei: deviceImei,
          isAssociated: true,
          immatriculation: selectedVehicle,
          entreprise: vehicle?.company?.name || selectedCompany,
          companyId: selectedCompany,
        };
        
        onSuccess(updatedDevice);
        onClose();
      }
    } catch (error: any) {
      console.error('Association error:', error);
      
      // If error is about existing association and we haven't forced yet
      if (error.message?.includes('déjà associé') && !forceAssociation) {
        setShowConfirmation(true);
      } else {
        toast({
          title: "Erreur d'association",
          description: error.message || "Erreur lors de l'association",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmForce = () => {
    setShowConfirmation(false);
    handleSubmit(true); // Force the association
  };

  const handleCancelForce = () => {
    setShowConfirmation(false);
    setConflictingVehicle(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Device IMEI Display */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="text-sm text-muted-foreground">Boîtier IMEI</div>
          <div className="text-lg font-semibold text-primary">{deviceImei}</div>
        </div>

        {/* Company Selection */}
        <div className="space-y-2">
          <Label htmlFor="company">Entreprise *</Label>
          <CompanySearchSelect
            value={selectedCompany}
            onValueChange={setSelectedCompany}
            placeholder="Sélectionner une entreprise"
          />
        </div>

        {/* Vehicle Selection */}
        <div className="space-y-2">
          <Label htmlFor="vehicle">Véhicule * (recherche par immat ou nom)</Label>
          <SearchableSelect
            options={vehicleOptions}
            value={selectedVehicle}
            onValueChange={handleVehicleSelect}
            placeholder={
              !selectedCompany 
                ? "Sélectionnez d'abord une entreprise"
                : loadingVehicles 
                ? "Chargement..."
                : "Rechercher un véhicule"
            }
            emptyMessage="Aucun véhicule trouvé"
            disabled={!selectedCompany || loadingVehicles}
          />
          {loadingVehicles && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement des véhicules...
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={!selectedVehicle || isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isSubmitting ? "Association..." : "Associer"}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Véhicule déjà associé
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Le véhicule <strong>{selectedVehicle}</strong> est déjà associé au boîtier{' '}
                <strong>{conflictingVehicle?.device?.imei || conflictingVehicle?.vehicleDeviceImei}</strong>.
              </p>
              <p>
                Voulez-vous dissocier l'ancien boîtier et associer le nouveau boîtier{' '}
                <strong>{deviceImei}</strong> à ce véhicule ?
              </p>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  ⚠️ Cette action va dissocier automatiquement l'ancien boîtier de ce véhicule.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelForce}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmForce}>
              Confirmer l'association
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
