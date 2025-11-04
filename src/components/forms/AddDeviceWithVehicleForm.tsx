import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CompanySearchSelect } from "@/components/ui/company-search-select";
import { useCompanyVehicleDevice } from "@/hooks/useCompanyVehicleDevice";
import { useVehicleValidation } from "@/hooks/useVehicleValidation";
import { useImeiValidation } from "@/hooks/useImeiValidation";
import { createDeviceWithVehicleAssociation } from "@/services/DeviceService";
import { searchCompaniesReal } from "@/services/CompanyVehicleDeviceService";
import { toast } from "@/components/ui/use-toast";
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

interface AddDeviceWithVehicleFormProps {
  onClose?: () => void;
  onSuccess?: (devices: any[]) => void;
}

export default function AddDeviceWithVehicleForm({ onClose, onSuccess }: AddDeviceWithVehicleFormProps) {
  // Vehicle fields
  const [nomVehicule, setNomVehicule] = useState("");
  const [immatriculation, setImmatriculation] = useState("");
  const [categorie, setCategorie] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [emplacement, setEmplacement] = useState("");
  const [kilometrage, setKilometrage] = useState("");
  
  // Device fields
  const [imei, setImei] = useState("");
  const [constructor, setConstructor] = useState("");
  const [sim, setSim] = useState("");
  const [telephone, setTelephone] = useState("");
  const [typeBoitier, setTypeBoitier] = useState("");
  
  // State management
  const [entreprises, setEntreprises] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const { loadCompaniesForSelect } = useCompanyVehicleDevice();
  
  // Confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState<{
    type: 'new' | 'existing-free' | 'existing-associated' | 'no-imei';
    imei?: string;
  } | null>(null);

  // Vehicle validation
  const { 
    isValidating, 
    validationError, 
    checkImmatriculation, 
    validateImmatFormat,
    clearValidationError 
  } = useVehicleValidation();
  
  // IMEI validation
  const { checkImei, validateImeiFormat } = useImeiValidation();
  
  const [immatValidationStatus, setImmatValidationStatus] = useState(null);
  const [existingVehicle, setExistingVehicle] = useState(null);

  // Fetch companies on component mount
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

  // Debounced immatriculation validation
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (immatriculation && immatriculation.trim()) {
        const formatValidation = validateImmatFormat(immatriculation);
        if (!formatValidation.isValid) {
          setImmatValidationStatus('invalid');
          return;
        }

        try {
          const result = await checkImmatriculation(immatriculation);
          if (result.exists) {
            setImmatValidationStatus('exists');
            setExistingVehicle(result.vehicle);
          } else {
            setImmatValidationStatus('valid');
            setExistingVehicle(null);
          }
        } catch (error) {
          console.error('Error validating immatriculation:', error);
          setImmatValidationStatus('invalid');
        }
      } else {
        setImmatValidationStatus(null);
        setExistingVehicle(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [immatriculation, checkImmatriculation, validateImmatFormat]);

  const showToast = (severity: 'success' | 'error' | 'warning', summary: string, detail: string) => {
    toast({
      title: summary,
      description: detail,
      variant: severity === 'error' ? 'destructive' : 'default',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!immatriculation) {
        showToast('error', 'Erreur', 'L\'immatriculation est obligatoire');
        return;
      }

      const formatValidation = validateImmatFormat(immatriculation);
      if (!formatValidation.isValid) {
        showToast('error', 'Erreur', formatValidation.error);
        return;
      }

      if (immatValidationStatus === 'exists' && existingVehicle) {
        const confirmMessage = `Un véhicule avec l'immatriculation "${immatriculation}" existe déjà (Entreprise: ${existingVehicle.entreprise || 'Non définie'}). Voulez-vous continuer ?`;
        
        if (!window.confirm(confirmMessage)) {
          showToast('warning', 'Opération annulée', 'Veuillez modifier l\'immatriculation pour créer un nouveau véhicule');
          return;
        }
      }
      
      if (!entreprise) {
        showToast('error', 'Erreur', 'Veuillez sélectionner une entreprise');
        return;
      }

      // Si un IMEI est saisi, vérifier son statut
      if (imei && imei.trim()) {
        // Valider le format
        const imeiFormatValidation = validateImeiFormat(imei.trim());
        if (!imeiFormatValidation.isValid) {
          showToast('error', 'Format IMEI invalide', imeiFormatValidation.error);
          return;
        }

        // Vérifier l'existence du boîtier
        const result = await checkImei(imei.trim());
        
        // Déterminer le scénario et afficher le dialogue approprié
        if (!result.exists) {
          // Scénario 3: IMEI n'existe pas → proposer de le créer
          setConfirmDialogData({
            type: 'new',
            imei: imei.trim()
          });
          setShowConfirmDialog(true);
          return;
        } else if (result.isAssociated) {
          // Scénario 2b: IMEI existe et est déjà associé → demander si on écrase
          setConfirmDialogData({
            type: 'existing-associated',
            imei: imei.trim()
          });
          setShowConfirmDialog(true);
          return;
        } else {
          // Scénario 2a: IMEI existe et n'est pas associé → confirmer l'association
          setConfirmDialogData({
            type: 'existing-free',
            imei: imei.trim()
          });
          setShowConfirmDialog(true);
          return;
        }
      } else {
        // Scénario 1: Pas d'IMEI → créer juste le véhicule
        setConfirmDialogData({
          type: 'no-imei'
        });
        setShowConfirmDialog(true);
      }
      
    } catch (error) {
      console.error('Error in form submission:', error);
      showToast('error', 'Erreur', `Erreur lors de la validation: ${error.message}`);
    }
  };

  const proceedWithCreation = async () => {
    setIsCreating(true);
    
    try {
      const selectedCompany = entreprises.find(company => (company.id || company.name) === entreprise);
      const companyId = selectedCompany ? selectedCompany.id : null;

      if (!companyId) {
        showToast('error', 'Erreur', 'Entreprise sélectionnée invalide');
        return;
      }

      const protocolIdNumber = typeBoitier ? parseInt(typeBoitier.replace(/[^0-9]/g, '')) || null : null;

      const creationData = {
        immatriculation,
        nomVehicule,
        categorie,
        marque,
        modele,
        emplacement,
        kilometrage,
        companyVehiclesId: companyId,
        company: selectedCompany,
        imei,
        constructor: constructor || imei,
        sim: telephone || sim,
        telephone,
        protocolId: protocolIdNumber
      };

      console.log('Creating device with vehicle association:', creationData);

      const result = await createDeviceWithVehicleAssociation(creationData);

      if (result.success) {
        showToast('success', 'Succès', `${result.successCount} appareil(s) créé(s) et associé(s) au véhicule`);
        
        if (onSuccess) {
          onSuccess(result.devices);
        }
        
        // Reset form
        resetForm();
        
        if (onClose) onClose();
      } else {
        showToast('error', 'Échec', 'Aucun appareil n\'a pu être créé');
      }

      if (result.errorCount > 0) {
        const errorMessage = result.errors.join(', ').substring(0, 100) + (result.errors.length > 100 ? '...' : '');
        showToast('warning', 'Certains IMEI ont échoué', errorMessage);
      }
      
    } catch (error) {
      console.error('Error in form submission:', error);
      
      let errorMessage = error.message || 'Erreur inconnue';
      
      if (error.message && error.message.includes('immatriculation existe déjà')) {
        errorMessage = 'Cette immatriculation est déjà utilisée. Veuillez en choisir une autre ou associer le boîtier au véhicule existant.';
      }
      
      showToast('error', 'Erreur', `Erreur lors de la création: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setImmatriculation("");
    setNomVehicule("");
    setCategorie("");
    setMarque("");
    setModele("");
    setEmplacement("");
    setKilometrage("");
    setImei("");
    setConstructor("");
    setSim("");
    setTelephone("");
    setTypeBoitier("");
    setEntreprise("");
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

  const renderImmatValidationIcon = () => {
    if (isValidating) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
    }
    
    switch (immatValidationStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'exists':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getImmatValidationMessage = () => {
    if (validationError) {
      return { type: 'error', message: validationError };
    }
    
    switch (immatValidationStatus) {
      case 'valid':
        return { type: 'success', message: 'Immatriculation disponible' };
      case 'exists':
        return { 
          type: 'warning', 
          message: `Véhicule existant${existingVehicle?.entreprise ? ` (${existingVehicle.entreprise})` : ''}. Le boîtier sera associé au véhicule existant.` 
        };
      case 'invalid':
        const formatValidation = validateImmatFormat(immatriculation);
        return { type: 'error', message: formatValidation.error || 'Format invalide' };
      default:
        return null;
    }
  };

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialogData?.type === 'new' && 'Créer un nouveau boîtier'}
              {confirmDialogData?.type === 'existing-free' && 'Associer le boîtier existant'}
              {confirmDialogData?.type === 'existing-associated' && 'Réassocier le boîtier'}
              {confirmDialogData?.type === 'no-imei' && 'Créer le véhicule'}
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
                    Le boîtier sera créé et immédiatement associé au véhicule.
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
              {confirmDialogData?.type === 'no-imei' && (
                <>
                  <p className="font-medium text-blue-600">
                    ℹ️ Vous allez créer un véhicule sans boîtier associé.
                  </p>
                  <p>
                    Voulez-vous continuer ?
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
              setShowConfirmDialog(false);
              setIsCreating(true);
              await proceedWithCreation();
              setConfirmDialogData(null);
            }}>
              {confirmDialogData?.type === 'new' && 'Oui, créer et associer'}
              {confirmDialogData?.type === 'existing-free' && 'Oui, associer'}
              {confirmDialogData?.type === 'existing-associated' && 'Oui, réassocier'}
              {confirmDialogData?.type === 'no-imei' && 'Oui, créer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Information Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900">Informations Véhicule *</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="relative">
                <Input 
                  placeholder="Immatriculation *"
                  value={immatriculation} 
                  onChange={(e) => {
                    setImmatriculation(e.target.value);
                    clearValidationError();
                  }}
                  required
                  className={`pr-10 ${
                    immatValidationStatus === 'valid' ? 'border-green-500' :
                    immatValidationStatus === 'exists' ? 'border-orange-500' :
                    immatValidationStatus === 'invalid' ? 'border-red-500' : ''
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {renderImmatValidationIcon()}
                </div>
              </div>
              
              {(() => {
                const validation = getImmatValidationMessage();
                if (!validation) return null;
                
                const textColor = validation.type === 'success' ? 'text-green-600' :
                                validation.type === 'warning' ? 'text-orange-600' : 'text-red-600';
                
                return (
                  <p className={`text-xs mt-1 ${textColor}`}>
                    {validation.message}
                  </p>
                );
              })()}
            </div>
            
            <div>
              <Input 
                placeholder="Nom Véhicule"
                value={nomVehicule} 
                onChange={(e) => setNomVehicule(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SearchableSelect 
                options={categorieOptions}
                value={categorie}
                onValueChange={setCategorie}
                placeholder="Catégorie"
              />
            </div>
            
            <div>
              <SearchableSelect 
                options={marqueOptions}
                value={marque}
                onValueChange={(value) => {
                  setMarque(value);
                  setModele("");
                }}
                placeholder="Marque"
              />
            </div>
            
            <div>
              <SearchableSelect 
                options={modeleOptions}
                value={modele} 
                onValueChange={setModele}
                placeholder="Modèle" 
                disabled={!marque}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CompanySearchSelect 
                value={entreprise}
                onValueChange={setEntreprise}
                placeholder="Rechercher une entreprise... *"
                searchFunction={searchCompaniesReal}
              />
            </div>
            <div>
              <Input 
                placeholder="Emplacement"
                value={emplacement}
                onChange={(e) => setEmplacement(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Input 
              placeholder="Kilométrage"
              value={kilometrage} 
              onChange={(e) => setKilometrage(e.target.value)}
            />
          </div>
        </div>

        {/* Association avec un boîtier */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Association avec un boîtier (optionnel)</h3>
          </div>
          
          <div className="space-y-2">
            <Input 
              placeholder="Saisissez l'IMEI du boîtier (15 chiffres)"
              value={imei} 
              onChange={(e) => setImei(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si vous saisissez un IMEI, le système vérifiera automatiquement son existence lors de la création.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 mt-6">
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
                Créer le véhicule
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
