
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Eye, EyeOff, Save } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface AddUserFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserForm({ onClose, onSuccess }: AddUserFormProps) {
  const [nom, setNom] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Données factices des entreprises
  const entreprises = ["MBSC", "PHENIX IDFTP", "ADANEV MOBILITES", "Kick Services", "MATTEI / HABICONFORT"];
  
  const entrepriseOptions = entreprises.map(company => ({
    value: company,
    label: company
  }));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !motDePasse || !entreprise) {
      return;
    }
    
    console.log("Utilisateur ajouté:", {
      nom,
      motDePasse,
      entreprise
    });
    
    onSuccess();
  };
  
  return (
    <>
      <DialogHeader className="mb-5">
        <DialogTitle>Ajouter un utilisateur</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Input 
              placeholder="Nom Utilisateur"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          <div>
            <SearchableSelect 
              options={entrepriseOptions}
              value={entreprise}
              onValueChange={setEntreprise}
              placeholder="Entreprise"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </DialogClose>
          <Button 
            type="submit"
            disabled={!nom || !motDePasse || !entreprise}
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </form>
    </>
  );
}
