
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { 
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import * as CompanyService from "@/services/CompanyService";

interface AddCompanyFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCompanyForm({ onClose, onSuccess }: AddCompanyFormProps) {
  // Champs entreprise (étendus selon le nouveau schéma)
  const [societe, setSociete] = useState("");
  const [siren, setSiren] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [phone, setPhone] = useState("");
  
  // Champs utilisateur (étendus selon le nouveau schéma)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // États
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!societe || !username || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const companyData = {
        name: societe,
        siret: siren,
        address: address,
        postalCode: postalCode,
        city: city,
        contact: contact,
        email: email,
        mobile: mobile,
        phone: phone
      };
      
      const userData = {
        username: username,
        password: password,
        email: userEmail || email || 'default@test.com',
        firstname: firstname,
        lastname: lastname,
        mobile: userMobile
      };
      
      console.log("Creating company with user (enhanced)...", { companyData, userData });
      
      await CompanyService.createCompanyWithUser({
        companyData,
        userData
      });
      
      toast({
        title: "Succès",
        description: "Entreprise et utilisateur créés avec succès",
      });
      
      onSuccess();
      
    } catch (error) {
      console.error("Error creating company with user:", error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <DialogHeader className="mb-5 flex flex-row items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <DialogTitle>Ajouter une entreprise</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <Input 
              placeholder="Nom de l'entreprise *"
              value={societe}
              onChange={(e) => setSociete(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Input 
              placeholder="Adresse"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <Input 
              placeholder="Code postal"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <Input 
              placeholder="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <Input 
              placeholder="Contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <Input 
              placeholder="Email entreprise"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <Input 
              placeholder="Mobile entreprise"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <Input 
              placeholder="Téléphone entreprise"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3">Utilisateur Admin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <Input 
                placeholder="Nom d'utilisateur *"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-1">
              <Input 
                placeholder="Email utilisateur"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Input 
                placeholder="Prénom"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Input 
                placeholder="Nom"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
            <div className="relative md:col-span-1">
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            type="submit"
            disabled={!societe || !username || !password || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </>
  );
}
