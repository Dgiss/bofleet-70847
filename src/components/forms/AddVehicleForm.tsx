import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CompanySearchSelect } from "@/components/ui/company-search-select";
import { useCompanyVehicleDevice } from "@/hooks/useCompanyVehicleDevice";
import SimpleDeviceService from "@/services/SimpleDeviceService";
import { searchCompaniesReal } from "@/services/CompanyVehicleDeviceService";
import { toast } from "@/components/ui/use-toast";
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
const categories = ["Voiture", "Utilitaire", "Camion", "Moto"];
const marques = ["Peugeot", "Renault", "Citroën", "Toyota", "Fiat", "BMW", "Mercedes"];
const modeles = {
  "Peugeot": ["208", "308", "3008", "5008"],
  "Renault": ["Clio", "Megane", "Captur", "Master"],
  "Citroën": ["C3", "C4", "Berlingo", "Jumpy"],
  "Toyota": ["Yaris", "Corolla", "RAV4", "Hilux"],
  "Fiat": ["500", "Panda", "Ducato", "Doblo"],
  "BMW": ["Serie 1", "Serie 3", "Serie 5", "X5"],
  "Mercedes": ["Classe A", "Classe C", "Classe E", "Sprinter"]
};
const emplacements = ["Paris", "Lyon", "Marseille", "Toulouse", "Lille", "Bordeaux", "Nantes", "Strasbourg", "Nice", "Rennes", "Montpellier"];
interface AddVehicleFormProps {
  onClose?: () => void;
  onSave?: (data: any) => void;
  initialData?: any;
  isEditing?: boolean;
}
export default function AddVehicleForm({
  onClose,
  onSave,
  initialData,
  isEditing = false
}: AddVehicleFormProps) {
  const [nomVehicule, setNomVehicule] = useState("");
  const [immatriculation, setImmatriculation] = useState("");
  const [categorie, setCategorie] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [emplacement, setEmplacement] = useState("");
  const [imei, setImei] = useState("");
  const [typeBoitier, setTypeBoitier] = useState("");
  const [sim, setSim] = useState("");
  const [telephone, setTelephone] = useState("");
  const [kilometrage, setKilometrage] = useState("");
  const [type, setType] = useState("vehicle");
  const [entreprises, setEntreprises] = useState([]);
  const [isCreatingDevice, setIsCreatingDevice] = useState(false);
  const [shouldCreateDevice, setShouldCreateDevice] = useState(false);
  const [dissociateRequested, setDissociateRequested] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState<{
    type: 'new' | 'existing-free' | 'existing-associated';
    imei: string;
    formData: any;
  } | null>(null);
  
  const {
    loadCompaniesForSelect
  } = useCompanyVehicleDevice();
  
  const { checkImei, validateImeiFormat, isValidating } = useImeiValidation();
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companies = await loadCompaniesForSelect();
        setEntreprises(companies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setEntreprises([]);
      }
    };
    fetchCompanies();
  }, [loadCompaniesForSelect]);
  useEffect(() => {
    if (initialData && entreprises.length > 0) {
      setNomVehicule(initialData.nomVehicule || "");
      setImmatriculation(initialData.immatriculation || "");
      setCategorie(initialData.categorie || "");
      setMarque(initialData.marque || "");
      setModele(initialData.modele || "");
      const inputName = initialData.entreprise || "";
      const inputId = initialData.companyVehiclesId || initialData.companyId || "";
      let foundCompany = null as any;
      if (inputId) {
        foundCompany = entreprises.find(company => company.id === inputId) || null;
      }
      if (!foundCompany && inputName) {
        foundCompany = entreprises.find(company => company.name === inputName) || null;
      }
      const valueToSet = foundCompany ? foundCompany.id || foundCompany.name : inputId || inputName || "";
      setEntreprise(String(valueToSet));
      setEmplacement(initialData.emplacement || "");
      setImei(initialData.imei || "");
      setTypeBoitier(initialData.typeBoitier || "");
      setSim(initialData.sim || "");
      setTelephone(initialData.telephone || "");
      setKilometrage(initialData.kilometrage || "");
      setType(initialData.type || "vehicle");
    }
  }, [initialData, entreprises]);

  // Normalize/sanitize IMEI input: accept separators and pick the first 15-digit token
  const normalizeImeiInput = (value: string) => {
    const raw = typeof value === 'string' ? value : String(value || '');
    const tokens = raw.split(/[^0-9A-Za-z]+/).map(t => t.trim()).filter(Boolean);
    const preferred = tokens.find(t => /^\d{15}$/.test(t)) || tokens[0] || '';
    return preferred;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation préliminaire
    try {
      const entrepriseTrim = typeof entreprise === 'string' ? entreprise.trim() : entreprise;
      const selectedCompany = entreprises.find(company => (company.id || company.name) === entrepriseTrim || company.name === entrepriseTrim);
      const isIdLike = typeof entrepriseTrim === 'string' && /[a-zA-Z0-9-]{8,}/.test(entrepriseTrim);
      const companyId = selectedCompany ? selectedCompany.id : isIdLike ? entrepriseTrim : null;
      const entrepriseName = selectedCompany ? selectedCompany.name : entrepriseTrim;
      console.log('[AddVehicleForm] Company resolution', {
        input: entreprise,
        trimmed: entrepriseTrim,
        selectedCompany,
        companyId,
        entrepriseName,
        isIdLike
      });
      if (type === "vehicle" && !immatriculation) {
        toast({
          title: "Erreur",
          description: "L'immatriculation est obligatoire pour créer un véhicule",
          variant: "destructive"
        });
        return;
      }
      if (type === "device" && !imei) {
        toast({
          title: "Erreur",
          description: "L'IMEI est obligatoire pour créer un boîtier",
          variant: "destructive"
        });
        return;
      }
      if (!companyId && !entrepriseName) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une entreprise",
          variant: "destructive"
        });
        return;
      }

      // Préparer les données du formulaire
      const formDataToSubmit = {
        entrepriseTrim,
        selectedCompany,
        companyId,
        entrepriseName
      };

      // Si un IMEI est saisi, vérifier automatiquement lors de la soumission
      if (imei && !isEditing) {
        const cleanImei = normalizeImeiInput(imei);
        
        // Valider le format
        const formatValidation = validateImeiFormat(cleanImei);
        if (!formatValidation.isValid) {
          toast({
            title: "Format IMEI invalide",
            description: formatValidation.error,
            variant: "destructive"
          });
          return;
        }

        // Vérifier l'existence du boîtier
        const result = await checkImei(cleanImei);
        setImei(cleanImei);
        
        // Déterminer le scénario et afficher le dialogue approprié
        if (!result.exists) {
          // Scénario 3: IMEI n'existe pas → proposer de le créer
          setConfirmDialogData({
            type: 'new',
            imei: cleanImei,
            formData: formDataToSubmit
          });
          setShowConfirmDialog(true);
          return;
        } else if (result.isAssociated) {
          // Scénario 2b: IMEI existe et est déjà associé → demander si on écrase
          setConfirmDialogData({
            type: 'existing-associated',
            imei: cleanImei,
            formData: formDataToSubmit
          });
          setShowConfirmDialog(true);
          return;
        } else {
          // Scénario 2a: IMEI existe et n'est pas associé → confirmer l'association
          setConfirmDialogData({
            type: 'existing-free',
            imei: cleanImei,
            formData: formDataToSubmit
          });
          setShowConfirmDialog(true);
          return;
        }
      }

      // Scénario 1: Pas d'IMEI → créer juste le véhicule et l'associer à la company
      await processFormSubmission(formDataToSubmit);
    } catch (error) {
      console.error('Error in form validation:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la validation du formulaire",
        variant: "destructive"
      });
    }
  };

  const processFormSubmission = async (formDataToSubmit: any) => {
    setIsCreatingDevice(true);
    try {
      const { companyId, entrepriseName } = formDataToSubmit;

      // En mode édition de véhicule: on renvoie un payload enrichi et on ne crée pas de boîtier ici
      if (isEditing && type === "vehicle") {
        const prevImei = initialData?.imei || initialData?.vehicleDeviceImei || "";
        const desired = normalizeImeiInput(imei);
        if (desired && !/^\d{15}$/.test(desired)) {
          toast({
            title: "IMEI invalide",
            description: "L'IMEI doit contenir 15 chiffres",
            variant: "destructive"
          });
          setIsCreatingDevice(false);
          return;
        }
        const protocolIdNumber = typeBoitier ? parseInt(typeBoitier.replace(/[^0-9]/g, '')) || undefined : undefined;
        const deviceUpdates: any = {};
        if (sim) deviceUpdates.sim = sim;
        if (protocolIdNumber !== undefined) deviceUpdates.protocolId = protocolIdNumber;
        let associationChange: 'none' | 'associate' | 'dissociate' = 'none';
        if (dissociateRequested || !desired && prevImei) associationChange = 'dissociate';else if (desired && desired !== prevImei) associationChange = 'associate';
        const payload = {
          immat: String(immatriculation || ""),
          immatriculation: String(immatriculation || ""),
          realImmat: String(immatriculation || ""),
          nomVehicule: String(nomVehicule || ""),
          categorie: String(categorie || ""),
          marque: String(marque || ""),
          modele: String(modele || ""),
          entreprise: String(entrepriseName || ""),
          companyVehiclesId: String(companyId || ""),
          emplacement: String(emplacement || ""),
          type: "vehicle",
          desiredVehicleDeviceImei: String(desired || ""),
          associationChange,
          deviceUpdates: Object.keys(deviceUpdates).length ? deviceUpdates : undefined
        };
        if (onSave) onSave(payload);
        if (onClose) onClose();
        setIsCreatingDevice(false);
        return;
      }
      let deviceCreated = false;
      let finalImei = "";

      // ÉTAPE 1: Créer le device AVANT le véhicule si nécessaire
      if (imei && !isEditing && shouldCreateDevice) {
        try {
          console.log('🔧 Step 1: Creating/checking device before vehicle creation...');
          const cleanImei = normalizeImeiInput(imei);
          
          // Vérifier si l'IMEI existe
          const result = await checkImei(cleanImei);
          
          if (result.exists) {
            // L'IMEI existe déjà, on l'associe simplement (peut être forcé si déjà associé)
            console.log('📱 Device already exists, will be associated to vehicle');
            deviceCreated = true;
            finalImei = cleanImei;
          } else {
            // L'IMEI n'existe pas, on le crée sans les informations optionnelles
            console.log('🆕 Creating new device...');
            const createdDevice = await SimpleDeviceService.createDeviceSimple({
              imei: cleanImei,
              sim: null, // Pas d'informations optionnelles
              protocolId: null,
              companyId: companyId
            });
            deviceCreated = true;
            finalImei = createdDevice.imei;
            console.log('✅ Device created successfully:', finalImei);
            toast({
              title: "Boîtier créé",
              description: `Boîtier ${finalImei} créé avec succès`
            });
          }
        } catch (deviceError) {
          console.error('❌ Error creating device:', deviceError);
          toast({
            title: "Erreur boîtier",
            description: `Erreur lors de la création du boîtier: ${deviceError.message}`,
            variant: "destructive"
          });
          setIsCreatingDevice(false);
          return;
        }
      }
      const formData = {
        immat: String(immatriculation || ""),
        immatriculation: String(immatriculation || ""),
        realImmat: String(immatriculation || ""),
        nomVehicule: String(nomVehicule || ""),
        categorie: String(categorie || ""),
        marque: String(marque || ""),
        modele: String(modele || ""),
        entreprise: String(entrepriseName || ""),
        companyVehiclesId: String(companyId || ""),
        emplacement: String(emplacement || ""),
        imei: String(finalImei || ""),
        vehicleDeviceImei: String(finalImei || ""),
        typeBoitier: String(typeBoitier || ""),
        sim: String(sim || ""),
        telephone: String(telephone || ""),
        kilometrage: String(kilometrage || ""),
        type: String(type || "vehicle"),
        deviceCreated: Boolean(deviceCreated)
      };
      console.log('🚗 Step 2: Creating vehicle with device association...');
      console.log('Vehicle will be created with finalImei:', finalImei);
      if (onSave) {
        onSave(formData);
      }
      console.log('✅ Vehicle creation process completed successfully');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la soumission du formulaire",
        variant: "destructive"
      });
    } finally {
      setIsCreatingDevice(false);
    }
  };
  const filteredModeles = marque ? modeles[marque as keyof typeof modeles] || [] : [];
  const entrepriseOptions = entreprises.map(company => ({
    value: company.id || company.name,
    label: company.name
  }));
  const categorieOptions = categories.map(cat => ({
    value: cat,
    label: cat
  }));
  const marqueOptions = marques.map(m => ({
    value: m,
    label: m
  }));
  const modeleOptions = filteredModeles.map(m => ({
    value: m,
    label: m
  }));
  const emplacementOptions = emplacements.map(emp => ({
    value: emp,
    label: emp
  }));
  const boitierTypes = ["GPS Simple", "GPS Tracker", "GPS Avancé"];
  const boitierTypeOptions = boitierTypes.map(type => ({
    value: type,
    label: type
  }));
  const isVehicle = type === "vehicle";
  const isDevice = type === "device";
  
  return <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialogData?.type === 'new' && 'Créer un nouveau boîtier'}
              {confirmDialogData?.type === 'existing-free' && 'Associer le boîtier existant'}
              {confirmDialogData?.type === 'existing-associated' && 'Réassocier le boîtier'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {confirmDialogData?.type === 'new' && (
                <>
                  <p className="font-medium text-amber-600">
                    ℹ️ Le boîtier avec l'IMEI {confirmDialogData.imei} n'existe pas encore.
                  </p>
                  <p>
                    Voulez-vous créer ce boîtier et l'associer au véhicule ?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Le boîtier sera créé sans les informations optionnelles (vous pourrez les ajouter plus tard).
                  </p>
                </>
              )}
              {confirmDialogData?.type === 'existing-free' && (
                <>
                  <p className="font-medium text-blue-600">
                    ✓ Le boîtier avec l'IMEI {confirmDialogData.imei} existe déjà.
                  </p>
                  <p>
                    Ce boîtier n'est pas associé à un véhicule. Voulez-vous l'associer à ce véhicule ?
                  </p>
                </>
              )}
              {confirmDialogData?.type === 'existing-associated' && (
                <>
                  <p className="font-medium text-orange-600">
                    ⚠️ Le boîtier avec l'IMEI {confirmDialogData.imei} est déjà associé à un autre véhicule.
                  </p>
                  <p>
                    Voulez-vous écraser l'association actuelle et réassocier ce boîtier au nouveau véhicule ?
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false);
              setConfirmDialogData(null);
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              setShouldCreateDevice(true);
              setShowConfirmDialog(false);
              if (confirmDialogData?.formData) {
                await processFormSubmission(confirmDialogData.formData);
                setConfirmDialogData(null);
              }
            }}>
              {confirmDialogData?.type === 'new' && 'Oui, créer et associer'}
              {confirmDialogData?.type === 'existing-free' && 'Oui, associer'}
              {confirmDialogData?.type === 'existing-associated' && 'Oui, réassocier'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {!isEditing && <DialogHeader className="mb-5">
          <DialogTitle>Ajouter un {isVehicle ? "Véhicule" : "Boîtier"}</DialogTitle>
        </DialogHeader>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isVehicle && <>
              <div>
                <Input placeholder="Nom Véhicule" value={nomVehicule} onChange={e => setNomVehicule(e.target.value)} />
              </div>
              <div>
                <Input placeholder="Immatriculation" value={immatriculation} onChange={e => setImmatriculation(e.target.value)} />
              </div>
            </>}
          
          {isDevice && <>
              <div>
                <Input 
                  placeholder="IMEI (15 chiffres)" 
                  value={imei} 
                  onChange={e => {
                    setImei(e.target.value);
                  }} 
                  readOnly={isEditing}
                  disabled={isValidating}
                />
              </div>
              <div>
                <Input placeholder="SIM" value={sim} onChange={e => setSim(e.target.value)} />
              </div>
            </>}
        </div>

        {isVehicle && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SearchableSelect options={categorieOptions} value={categorie} onValueChange={setCategorie} placeholder="Categorie" />
            </div>
            
            <div>
              <SearchableSelect options={marqueOptions} value={marque} onValueChange={value => {
            setMarque(value);
            setModele("");
          }} placeholder="Marque" />
            </div>
            
            <div>
              <SearchableSelect options={modeleOptions} value={modele} onValueChange={setModele} placeholder="Model" disabled={!marque} />
            </div>
          </div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CompanySearchSelect value={entreprise} onValueChange={setEntreprise} placeholder="Rechercher une entreprise..." searchFunction={searchCompaniesReal} />
          </div>
          <div>
            <Input placeholder="Emplacement" value={emplacement} onChange={e => setEmplacement(e.target.value)} />
          </div>
        </div>

        {isDevice && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SearchableSelect options={boitierTypeOptions} value={typeBoitier} onValueChange={setTypeBoitier} placeholder="Type de boîtier" />
            </div>
            <div>
              <Input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} />
            </div>
          </div>}

        {isVehicle && <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <Input placeholder="Kilométrage" value={kilometrage} onChange={e => setKilometrage(e.target.value)} />
            </div>
          </div>}

        {/* Association avec un boîtier pour les véhicules (non-édition) */}
        {isVehicle && !isEditing && (
          <div className="space-y-3 border rounded-md p-4 bg-gray-50">
            <h3 className="text-sm font-semibold">Association avec un boîtier (optionnel)</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Input 
                  placeholder="IMEI du boîtier (15 chiffres)" 
                  value={imei} 
                  onChange={e => {
                    setImei(e.target.value);
                    setShouldCreateDevice(false);
                  }} 
                  disabled={isValidating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Si vous saisissez un IMEI, le système vérifiera automatiquement son existence lors de la création du véhicule.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isEditing && isVehicle && <div className="space-y-3 border rounded-md p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Gestion du boîtier</h3>
              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                placeholder="IMEI (15 chiffres)" 
                value={imei} 
                onChange={e => {
                  setImei(e.target.value);
                  setDissociateRequested(false);
                }} 
                onBlur={e => setImei(normalizeImeiInput(e.target.value))}
              />
              <Input placeholder="SIM" value={sim} onChange={e => setSim(e.target.value)} />
              <SearchableSelect options={boitierTypeOptions} value={typeBoitier} onValueChange={setTypeBoitier} placeholder="Type de boîtier" />
            </div>
            <p className="text-xs text-muted-foreground">Saisissez un nouvel IMEI pour ré-associer, ou videz pour dissocier.</p>
          </div>}
        

        <div className="flex justify-end gap-2 mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isCreatingDevice}>
            {isCreatingDevice ? <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? "Mise à jour..." : "Création..."}
              </> : <>
                {isEditing ? "Mettre à jour" : "Enregistrer"}
              </>}
          </Button>
        </div>
      </form>
    </>;
}