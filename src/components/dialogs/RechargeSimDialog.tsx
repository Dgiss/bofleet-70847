import React, { useState, useEffect } from "react";
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
import {
  rechargeTruphoneSim,
  rechargeTruphoneSimByPlan,
  getAvailableTruphoneRatePlans,
  TruphoneRatePlan,
} from "@/services/TruphoneService";
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
  const [truphonePlans, setTruphonePlans] = useState<TruphoneRatePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const { toast } = useToast();

  // Charger les plans Truphone quand le dialog s'ouvre pour une SIM Truphone
  useEffect(() => {
    if (open && sim?.provider === "Truphone") {
      setLoadingPlans(true);
      getAvailableTruphoneRatePlans()
        .then((plans) => {
          setTruphonePlans(plans);
          if (plans.length > 0) {
            setSelectedPlanId(plans[0].id); // Sélectionner le premier plan par défaut
          }
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des plans Truphone:", err);
          toast({
            title: "Erreur",
            description: "Impossible de charger les plans tarifaires Truphone",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoadingPlans(false);
        });
    }
  }, [open, sim?.provider, toast]);

  const handleRecharge = async () => {
    if (!sim) return;

    // Pour Truphone, vérifier qu'un plan est sélectionné
    if (isTruphone && !selectedPlanId) {
      setError("Veuillez sélectionner un plan tarifaire");
      return;
    }

    // Pour les autres opérateurs, vérifier le volume
    const volumeNum = parseInt(volume);
    if (!isTruphone && (isNaN(volumeNum) || volumeNum <= 0)) {
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
          success = await rechargeThingsMobileSim(sim.msisdn, volumeNum, sim.iccid);
          break;

        case "Truphone":
          // Si un plan spécifique est sélectionné, l'utiliser directement
          if (selectedPlanId) {
            console.log(`🔄 Recharge Truphone: ${sim.iccid} - Plan: ${selectedPlanId}`);
            try {
              success = await rechargeTruphoneSimByPlan(sim.iccid, selectedPlanId);
            } catch (apiError: any) {
              setError(
                "⚠️ Échec du changement de plan tarifaire Truphone. " +
                "Veuillez effectuer la recharge manuellement via le portail IoT : https://iot.truphone.com/"
              );
              throw apiError;
            }
          } else {
            // Fallback sur la méthode par volume (legacy)
            console.log(`🔄 Recharge Truphone: ${sim.iccid} - ${volumeNum} MB`);
            try {
              success = await rechargeTruphoneSim(sim.iccid, volumeNum);
            } catch (apiError: any) {
              setError(
                "⚠️ La recharge Truphone nécessite une configuration de plans tarifaires. " +
                "Veuillez effectuer la recharge manuellement via le portail IoT ou configurer Auto Top-Up : https://docs.things.1global.com/docs/get-started/configure-auto-topup/"
              );
              throw apiError;
            }
          }
          break;

        default:
          throw new Error("Opérateur non supporté");
      }

      if (success) {
        const successMessage = isTruphone && selectedPlanId
          ? `Plan changé pour ${sim.iccid}`
          : `${volumeNum} MB ajoutés à ${sim.msisdn || sim.iccid}`;

        toast({
          title: "Recharge réussie",
          description: successMessage,
        });
        onSuccess?.();
        onOpenChange(false);
        setVolume("");
        setSelectedPlanId("");
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

  // Plans tarifaires spécifiques à chaque opérateur (non-Truphone uniquement)
  const getVolumePresets = () => {
    switch (sim.provider) {
      case "Things Mobile":
        // Things Mobile a un max de 1000 MB par recharge
        return [100, 500, 1000];

      case "Phenix":
      default:
        // Phenix et autres - plans standards
        return [100, 500, 1000, 5000];
    }
  };

  const volumePresets = getVolumePresets();
  const isTruphone = sim.provider === "Truphone";

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

          {/* Pour Truphone: Sélection de plan tarifaire */}
          {isTruphone ? (
            <div className="space-y-2">
              <Label>Plans tarifaires Truphone disponibles</Label>
              {loadingPlans ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Chargement des plans...
                  </span>
                </div>
              ) : truphonePlans.length === 0 ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Aucun plan tarifaire disponible. Veuillez effectuer la recharge manuellement via le portail IoT.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {truphonePlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      disabled={loading}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        selectedPlanId === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="font-medium text-sm">{plan.name}</div>
                      {plan.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {plan.description}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        {plan.dataAllowance && (
                          <span className="text-primary font-medium">
                            {plan.dataAllowance} MB
                          </span>
                        )}
                        {plan.validity && (
                          <span className="text-muted-foreground">
                            {plan.validity} jours
                          </span>
                        )}
                        {plan.price && (
                          <span className="text-muted-foreground">
                            {plan.price} {plan.currency || "EUR"}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Volume à recharger (pour Things Mobile et Phenix) */}
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
                <Label>Montants prédéfinis - {sim.provider}</Label>
                <div className={`grid ${volumePresets.length === 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-2`}>
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
            </>
          )}

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
                <strong>Things Mobile:</strong> Recharge réelle via l'API rechargeSim.
                Montant maximum: 1000 MB par recharge. Le montant sera déduit de votre crédit partagé.
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
          <Button
            onClick={handleRecharge}
            disabled={loading || (isTruphone ? !selectedPlanId : !volume)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isTruphone ? "Changer de plan" : "Recharger"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
