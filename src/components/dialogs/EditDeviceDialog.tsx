import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { updateDevice } from "@/services/DeviceService";
import { Pencil } from "lucide-react";

interface EditDeviceDialogProps {
  device: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedDevice: any) => void;
}

export default function EditDeviceDialog({ device, open, onOpenChange, onSuccess }: EditDeviceDialogProps) {
  const [sim, setSim] = useState(device?.sim || "");
  const [protocolId, setProtocolId] = useState(device?.protocolId || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Update state when device changes
  useEffect(() => {
    if (device) {
      setSim(device.sim || "");
      setProtocolId(device.protocolId || "");
    }
  }, [device]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!device?.imei) {
      toast({
        title: "Erreur",
        description: "IMEI manquant",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const updatedData = {
        imei: device.imei,
        sim: sim.trim() || undefined,
        protocolId: protocolId.trim() || undefined,
      };

      await updateDevice(updatedData);

      toast({
        title: "Succès",
        description: "Boîtier mis à jour avec succès",
      });

      onSuccess(updatedData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du boîtier",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Modifier le boîtier
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imei">IMEI</Label>
            <Input
              id="imei"
              value={device?.imei || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              L'IMEI ne peut pas être modifié
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sim">Numéro SIM / Téléphone</Label>
            <Input
              id="sim"
              placeholder="Numéro SIM ou téléphone"
              value={sim}
              onChange={(e) => setSim(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Numéro de carte SIM ou numéro de téléphone associé au boîtier
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="protocolId">Protocol ID</Label>
            <Input
              id="protocolId"
              placeholder="ID du protocole"
              value={protocolId}
              onChange={(e) => setProtocolId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Identifiant du protocole de communication du boîtier
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mise à jour...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}