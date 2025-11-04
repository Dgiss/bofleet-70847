import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { AlertTriangle, Link2Off, Link2, Loader2 } from 'lucide-react';
import AssociateDeviceForm from '@/components/forms/AssociateDeviceForm';
import { dissociateDeviceFromVehicle } from '@/services/DeviceUniqueAssociationService';
import { toast } from '@/hooks/use-toast';

interface AssociateDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: {
    imei: string;
    isAssociated: boolean;
    immatriculation?: string;
    entreprise?: string;
    companyId?: string;
    sim?: string;
    protocolId?: string;
  };
  onSuccess: (updatedDevice?: any) => void;
}

export default function AssociateDeviceDialog({ 
  open, 
  onOpenChange, 
  device,
  onSuccess 
}: AssociateDeviceDialogProps) {
  const [showForm, setShowForm] = useState(false);
  const [isDissociating, setIsDissociating] = useState(false);

  const handleClose = () => {
    setShowForm(false);
    onOpenChange(false);
  };

  const handleSuccess = (updatedDevice?: any) => {
    setShowForm(false);
    onSuccess(updatedDevice);
    onOpenChange(false);
  };

  const handleDissociate = async () => {
    setIsDissociating(true);
    try {
      await dissociateDeviceFromVehicle(device.imei, device.immatriculation!);
      toast({
        title: "Dissociation réussie",
        description: `Boîtier ${device.imei} dissocié du véhicule ${device.immatriculation}`,
      });
      
      // Return updated device state after dissociation
      const updatedDevice = {
        ...device,
        isAssociated: false,
        immatriculation: '',
        entreprise: 'Boîtier libre',
        companyId: '',
      };
      
      handleSuccess(updatedDevice);
    } catch (error: any) {
      toast({
        title: "Erreur de dissociation",
        description: error.message || "Erreur lors de la dissociation",
        variant: "destructive",
      });
    } finally {
      setIsDissociating(false);
    }
  };

  const handleChangeAssociation = () => {
    setShowForm(true);
  };

  // Si on affiche le formulaire ou si le device est libre, montrer le formulaire
  if (showForm || !device.isAssociated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {device.isAssociated ? "Modifier l'association" : "Associer le boîtier"}
            </DialogTitle>
            <DialogDescription>
              {device.isAssociated 
                ? "Sélectionnez un nouveau véhicule pour ce boîtier"
                : "Sélectionnez une entreprise et un véhicule pour ce boîtier"
              }
            </DialogDescription>
          </DialogHeader>
          <AssociateDeviceForm
            deviceImei={device.imei}
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Si le device est déjà associé, montrer l'état actuel et les options
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600" />
            Boîtier associé
          </DialogTitle>
          <DialogDescription>
            Ce boîtier est actuellement associé à un véhicule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* IMEI */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground">Boîtier IMEI</div>
            <div className="text-lg font-semibold text-primary">{device.imei}</div>
          </div>

          {/* Current Association */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 font-medium">
              <AlertTriangle className="h-5 w-5" />
              Association actuelle
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Entreprise</div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  {device.entreprise || "Non définie"}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Véhicule</div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  {device.immatriculation || "Non défini"}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Que souhaitez-vous faire ?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={handleDissociate}
            disabled={isDissociating}
            className="text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
          >
            {isDissociating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {!isDissociating && <Link2Off className="h-4 w-4 mr-2" />}
            {isDissociating ? "Dissociation..." : "Dissocier"}
          </Button>
          <Button
            onClick={handleChangeAssociation}
            className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            variant="outline"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Changer l'association
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
