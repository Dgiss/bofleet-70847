
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Save, X } from "lucide-react";
import * as CompanyService from "@/services/CompanyService";

interface EditCompanyFormProps {
  company: any;
  onClose: () => void;
  onSuccess: (updatedCompany?: any) => void;
}

export default function EditCompanyForm({ company, onClose, onSuccess }: EditCompanyFormProps) {
  // Données entreprise
  const [name, setName] = useState(company.name || "");
  const [contact, setContact] = useState(company.contact || "");
  const [mobile, setMobile] = useState(company.mobile || "");
  const [email, setEmail] = useState(company.email || "");
  const [address, setAddress] = useState(company.address || "");
  const [city, setCity] = useState(company.city || "");
  const [siret, setSiret] = useState(company.siret || "");
  
  // Données utilisateur principal (premier utilisateur admin)
  const mainUser = company.users?.items?.find(user => user.role === 'Admin') || company.users?.items?.[0];
  const [userFirstname, setUserFirstname] = useState(mainUser?.firstname || "");
  const [userLastname, setUserLastname] = useState(mainUser?.lastname || "");
  const [userEmail, setUserEmail] = useState(mainUser?.email || "");
  const [userPhone, setUserPhone] = useState(mainUser?.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Erreur",
        description: "Le nom de l'entreprise est requis",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const companyData = {
        id: company.id,
        name,
        contact,
        mobile,
        email,
        address,
        city,
        siret
      };
      
      const userData = mainUser ? {
        id: mainUser.id,
        username: mainUser.username,
        email: userEmail,
        firstname: userFirstname,
        lastname: userLastname,
        phone: userPhone,
        role: mainUser.role
      } : null;
      
      const userCognitoData = mainUser ? {
        username: mainUser.username,
        email: userEmail,
        firstname: userFirstname,
        lastname: userLastname,
        newPassword: newPassword || undefined
      } : null;
      
      console.log("Updating company and user:", { companyData, userData, userCognitoData });
      
      await CompanyService.updateCompanyAndUser({
        companyData,
        userData,
        userCognitoData
      });
      
      toast({
        title: "Succès",
        description: "Entreprise et utilisateur mis à jour avec succès",
      });
      
      // Pass the updated company data to the parent
      onSuccess({
        ...company,
        ...companyData,
        users: company.users
      });
      
    } catch (error) {
      console.error("Error updating company and user:", error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Modifier l'entreprise</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom de l'entreprise *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Contact</label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Ville</label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">SIRET</label>
            <Input
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
            />
          </div>
        </div>
        
        {mainUser && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Utilisateur Principal ({mainUser.username})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <Input
                  value={userFirstname}
                  onChange={(e) => setUserFirstname(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <Input
                  value={userLastname}
                  onChange={(e) => setUserLastname(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <Input
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
              </div>
              
              <div className="relative md:col-span-2">
                <label className="block text-sm font-medium mb-1">Nouveau mot de passe (optionnel)</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Laisser vide pour ne pas changer"
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-8 transform"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button" disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
