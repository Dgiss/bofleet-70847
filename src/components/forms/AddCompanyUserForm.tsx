
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Eye, EyeOff, Save } from "lucide-react";
import { 
  DialogClose
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AddCompanyUserFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCompanyUserForm({ onClose, onSuccess }: AddCompanyUserFormProps) {
  // Company fields
  const [societe, setSociete] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  
  // User credentials
  const [createUser, setCreateUser] = useState(false);
  const [nom, setNom] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!societe) {
      return;
    }
    
    console.log("Entreprise ajoutée:", {
      entreprise: societe,
      telephone: mobile,
      email,
      adresse,
      ville,
      // User credentials if creating a user
      user: createUser ? {
        nom,
        motDePasse
      } : null
    });
    
    onSuccess();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1">
          <Input 
            placeholder="Société"
            value={societe}
            onChange={(e) => setSociete(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-1">
          <Input 
            placeholder="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        <div className="md:col-span-1">
          <Input 
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="md:col-span-1">
          <Input 
            placeholder="Adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Input 
            placeholder="Ville"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="createUser" 
          checked={createUser} 
          onCheckedChange={(checked) => setCreateUser(checked === true)}
        />
        <Label htmlFor="createUser">Créer un utilisateur pour cette entreprise</Label>
      </div>
      
      {createUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div className="md:col-span-1">
            <Input 
              placeholder="Nom Utilisateur"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required={createUser}
            />
          </div>
          
          <div className="relative md:col-span-1">
            <Input 
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required={createUser}
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
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </DialogClose>
        <Button 
          type="submit"
          disabled={!societe || (createUser && (!nom || !motDePasse))}
        >
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
