import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2 } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createDeviceSimple } from "@/services/SimpleDeviceService";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useImeiValidation } from "@/hooks/useImeiValidation";
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

interface AddDeviceFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AddDeviceForm({ onClose, onSuccess }: AddDeviceFormProps) {
  const { checkImei, validateImeiFormat } = useImeiValidation();
  
  // Mode rapide - plusieurs IMEIs
  const [multipleImeis, setMultipleImeis] = useState<string[]>([]);
  const [currentImei, setCurrentImei] = useState("");
  
  // Mode détaillé - un seul boîtier
  const [singleImei, setSingleImei] = useState("");
  const [constructor, setConstructor] = useState("");
  const [sim, setSim] = useState("");
  const [telephone, setTelephone] = useState("");
  const [typeBoitier, setTypeBoitier] = useState("");
  
  const [isCreating, setIsCreating] = useState(false);
  
  // États pour la vérification et confirmation
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imeiToCreate, setImeiToCreate] = useState("");
  const [imeiExists, setImeiExists] = useState(false);
  const [imeiIsAssociated, setImeiIsAssociated] = useState(false);

  const boitierTypes = ["GPS Simple", "GPS Tracker", "GPS Avancé"];
  const boitierTypeOptions = boitierTypes.map(type => ({
    value: type,
    label: type
  }));

  const handleAddImei = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && currentImei.trim()) {
      e.preventDefault();
      if (!multipleImeis.includes(currentImei.trim())) {
        setMultipleImeis(prev => [...prev, currentImei.trim()]);
      }
      setCurrentImei('');
    }
  };

  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Détecter si le texte contient des espaces (copier-coller)
    if (value.includes(' ')) {
      const imeis = value.split(/\s+/).filter(imei => imei.trim() !== '');
      const newImeis = imeis.filter(imei => !multipleImeis.includes(imei));
      if (newImeis.length > 0) {
        setMultipleImeis(prev => [...prev, ...newImeis]);
      }
      setCurrentImei('');
    } else {
      setCurrentImei(value);
    }
  };

  const handleRemoveImei = (imeiToRemove: string) => {
    setMultipleImeis(prev => prev.filter(imei => imei !== imeiToRemove));
  };

  const handleSubmitMultiple = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (multipleImeis.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins un IMEI',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const imei of multipleImeis) {
        try {
          await createDeviceSimple({
            imei: imei.trim(),
          });
          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push(`${imei}: ${error.message}`);
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Succès',
          description: `${successCount} boîtier(s) créé(s) avec succès`,
        });
        
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }

      if (errorCount > 0) {
        toast({
          title: 'Erreurs',
          description: `${errorCount} boîtier(s) n'ont pas pu être créés`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création des boîtiers',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!singleImei.trim()) {
      toast({
        title: 'Erreur',
        description: 'L\'IMEI est obligatoire',
        variant: 'destructive',
      });
      return;
    }

    // Valider le format de l'IMEI
    const formatValidation = validateImeiFormat(singleImei.trim());
    if (!formatValidation.isValid) {
      toast({
        title: 'Format IMEI invalide',
        description: formatValidation.error,
        variant: 'destructive',
      });
      return;
    }

    // Vérifier si l'IMEI existe déjà
    const result = await checkImei(singleImei.trim());
    setImeiExists(result.exists);
    setImeiIsAssociated(result.isAssociated || false);
    setImeiToCreate(singleImei.trim());

    // Afficher le dialog de confirmation
    setShowConfirmDialog(true);
  };

  const confirmCreateDevice = async () => {
    setShowConfirmDialog(false);
    setIsCreating(true);
    
    try {
      if (imeiExists) {
        // L'IMEI existe déjà - ne pas créer
        toast({
          title: 'IMEI existant',
          description: `Le boîtier ${imeiToCreate} existe déjà dans la base de données`,
          variant: 'destructive',
        });
        setIsCreating(false);
        return;
      }

      // L'IMEI n'existe pas - créer le boîtier sans informations optionnelles
      await createDeviceSimple({
        imei: imeiToCreate,
        constructor: constructor || undefined,
        sim: telephone || sim || undefined,
        protocolId: typeBoitier ? parseInt(typeBoitier.replace(/[^0-9]/g, '')) || undefined : undefined,
      });

      toast({
        title: 'Succès',
        description: 'Boîtier créé avec succès',
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création du boîtier',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {imeiExists ? "Boîtier existant" : "Créer un nouveau boîtier ?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {imeiExists ? (
                imeiIsAssociated ? (
                  <>
                    <p className="font-medium text-orange-600">
                      ⚠️ L'IMEI {imeiToCreate} existe et est déjà associé à un véhicule.
                    </p>
                    <p>
                      Vous ne pouvez pas créer un boîtier avec cet IMEI car il existe déjà dans la base de données.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-blue-600">
                      ℹ️ L'IMEI {imeiToCreate} existe déjà dans la base de données.
                    </p>
                    <p>
                      Ce boîtier existe mais n'est pas encore associé à un véhicule. Vous ne pouvez pas le créer à nouveau.
                    </p>
                  </>
                )
              ) : (
                <>
                  <p className="font-medium text-amber-600">
                    ℹ️ Le boîtier avec l'IMEI {imeiToCreate} n'existe pas encore.
                  </p>
                  <p>
                    Voulez-vous créer ce nouveau boîtier ?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Les informations complémentaires (Constructeur, SIM, Type) sont optionnelles et peuvent être ajoutées plus tard.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false);
              setImeiToCreate("");
              setImeiExists(false);
              setImeiIsAssociated(false);
            }}>
              {imeiExists ? 'Fermer' : 'Annuler'}
            </AlertDialogCancel>
            {!imeiExists && (
              <AlertDialogAction onClick={confirmCreateDevice}>
                Oui, créer le boîtier
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Tabs defaultValue="multiple" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="multiple">Plusieurs Boîtiers</TabsTrigger>
          <TabsTrigger value="single">Un Boîtier Détaillé</TabsTrigger>
        </TabsList>

      <TabsContent value="multiple" className="space-y-4">
        <form onSubmit={handleSubmitMultiple} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="multipleImei">IMEI (Entrée ou Espace pour ajouter)</Label>
            <Input
              id="multipleImei"
              placeholder="Saisir ou coller les IMEIs (séparés par espace ou entrée)"
              value={currentImei}
              onChange={handleImeiChange}
              onKeyDown={handleAddImei}
            />
            <p className="text-xs text-muted-foreground">
              Collez plusieurs IMEIs séparés par des espaces, ou ajoutez-les un par un avec Entrée/Espace
            </p>
          </div>

          {multipleImeis.length > 0 && (
            <div className="space-y-2">
              <Label>IMEIs à créer ({multipleImeis.length})</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {multipleImeis.map((imei, index) => (
                  <div
                    key={imei}
                    className="flex items-center justify-between p-2 rounded bg-muted"
                  >
                    <span className="font-mono text-sm">{index + 1}. {imei}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImei(imei)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isCreating || multipleImeis.length === 0}>
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer {multipleImeis.length} boîtier(s)
                </>
              )}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="single" className="space-y-4">
        <form onSubmit={handleSubmitSingle} className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Informations du Boîtier</h3>
            
            <div className="space-y-2">
              <Label htmlFor="singleImei">IMEI *</Label>
              <Input
                id="singleImei"
                placeholder="Numéro IMEI (15 chiffres)"
                value={singleImei}
                onChange={(e) => setSingleImei(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="constructor">Constructor</Label>
                <Input
                  id="constructor"
                  placeholder="Fabricant du boîtier"
                  value={constructor}
                  onChange={(e) => setConstructor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeBoitier">Type de boîtier</Label>
                <SearchableSelect
                  options={boitierTypeOptions}
                  value={typeBoitier}
                  onValueChange={setTypeBoitier}
                  placeholder="Sélectionner un type"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sim">SIM</Label>
                <Input
                  id="sim"
                  placeholder="Numéro SIM"
                  value={sim}
                  onChange={(e) => setSim(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  placeholder="Numéro de téléphone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le boîtier
                </>
              )}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
    </>
  );
}
