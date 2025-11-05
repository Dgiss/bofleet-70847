import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { rechargePhenixSim } from "@/services/PhenixService";
import { rechargeThingsMobileSim } from "@/services/ThingsMobileService";
import { rechargeTruphoneSim } from "@/services/TruphoneService";
import { useToast } from "@/components/ui/use-toast";

interface RechargeSimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sim: {
    msisdn: string;
    iccid: string;
    provider: string;
  } | null;
  onSuccess?: () => void;
}

export function RechargeSimDialog({
  open,
  onOpenChange,
  sim,
  onSuccess,
}: RechargeSimDialogProps) {
  const [volume, setVolume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRecharge = async () => {
    if (!sim) return;

    const volumeNum = parseInt(volume);
    if (isNaN(volumeNum) || volumeNum <= 0) {
      setError("Veuillez saisir un volume valide (en MB)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let success = false;

      switch (sim.provider) {
        case "Phenix":
          console.log(`🔄 Recharge Phenix: ${sim.msisdn} - ${volumeNum} MB`);
          success = await rechargePhenixSim(sim.msisdn, volumeNum);
          break;

        case "Things Mobile":
          console.log(`🔄 Recharge Things Mobile: ${sim.msisdn} - ${volumeNum} MB`);
          try {
            success = await rechargeThingsMobileSim(sim.msisdn, volumeNum);
          } catch (apiError: any) {
            // L'API n'est pas disponible, on affiche un message informatif
            setError(
              "⚠️ L'API de recharge Things Mobile n'est pas disponible publiquement. " +
              "Veuillez effectuer la recharge manuellement via le portail IoT : https://www.thingsmobile.com"
            );
            throw apiError;
          }
          break;

        case "Truphone":
          console.log(`🔄 Recharge Truphone: ${sim.iccid} - ${volumeNum} MB`);
          try {
            success = await rechargeTruphoneSim(sim.iccid, volumeNum);
          } catch (apiError: any) {
            // L'API nécessite un mapping de plans, on affiche un message informatif
            setError(
              "⚠️ La recharge Truphone nécessite une configuration de plans tarifaires. " +
              "Veuillez effectuer la recharge manuellement via le portail IoT ou configurer Auto Top-Up : https://docs.things.1global.com/docs/get-started/configure-auto-topup/"
            );
            throw apiError;
          }
          break;

        default:
          throw new Error("Opérateur non supporté");
      }

      if (success) {
        toast({
          title: "Recharge réussie",
          description: `${volumeNum} MB ajoutés à ${sim.msisdn || sim.iccid}`,
        });
        onSuccess?.();
        onOpenChange(false);
        setVolume("");
      } else {
        throw new Error("La recharge a échoué");
      }
    } catch (err: any) {
      console.error("Erreur de recharge:", err);
      const message = err.response?.data?.message || err.message || "Erreur inconnue";

      // Ne pas écraser le message d'erreur déjà défini
      if (!error) {
        setError(`Échec de la recharge: ${message}`);
      }

      toast({
        title: "Échec de la recharge",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!sim) return null;

  const volumePresets = [100, 500, 1000, 5000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recharger la carte SIM</DialogTitle>
          <DialogDescription>
            Ajouter du crédit data à la carte SIM
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informations SIM */}
          <div className="space-y-2 p-3 bg-muted rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opérateur:</span>
              <span className="font-medium">{sim.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MSISDN:</span>
              <span className="font-medium">{sim.msisdn || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ICCID:</span>
              <span className="font-medium">{sim.iccid}</span>
            </div>
          </div>

          {/* Volume à recharger */}
          <div className="space-y-2">
            <Label htmlFor="volume">Volume à recharger (MB)</Label>
            <Input
              id="volume"
              type="number"
              placeholder="Saisir le volume en MB"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              min="1"
              disabled={loading}
            />
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <Label>Montants prédéfinis</Label>
            <div className="grid grid-cols-4 gap-2">
              {volumePresets.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(String(preset))}
                  disabled={loading}
                >
                  {preset} MB
                </Button>
              ))}
            </div>
          </div>

          {/* Avertissement selon l'opérateur */}
          {sim.provider === "Phenix" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Phenix:</strong> Recharge réelle via l'API.
                {error?.includes("403") && (
                  <span className="block mt-1 text-red-600">
                    ⚠️ Erreur 403: Permissions API manquantes
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {sim.provider === "Things Mobile" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Things Mobile:</strong> L'API de recharge n'est pas documentée publiquement.
                Contactez Things Mobile pour obtenir l'accès à l'endpoint de recharge ou utilisez le portail IoT.
              </AlertDescription>
            </Alert>
          )}

          {sim.provider === "Truphone" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Truphone:</strong> La recharge nécessite un changement de plan tarifaire.
                Configurez les plans dans votre compte ou utilisez Auto Top-Up.
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button onClick={handleRecharge} disabled={loading || !volume}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Recharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
