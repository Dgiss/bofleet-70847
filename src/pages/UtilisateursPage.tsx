
import React, { useState, useEffect } from "react";
import { SearchForm } from "@/components/forms/SearchForm";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/dialogs/DeleteConfirmationDialog";
import EditUserForm from "@/components/forms/EditUserForm";
import { EnhancedDataTable } from "@/components/tables/EnhancedDataTable";
import * as UserService from "@/services/UserService";
import * as CompanyService from "@/services/CompanyService";

export default function UtilisateursPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: "nom", label: "Nom d'utilisateur", sortable: true },
    { id: "motDePasse", label: "Mot de passe", sortable: false },
    { id: "firstname", label: "Prénom", sortable: true },
    { id: "lastname", label: "Nom", sortable: true },
    { id: "entreprise", label: "Entreprise", sortable: true },
  ];

  // Fetch users and companies
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, companiesData] = await Promise.all([
        UserService.fetchUsers(),
        CompanyService.fetchAllCompanies()
      ]);
      
      // Map company names to users
      const usersWithCompanies = usersData.map(user => {
        const company = companiesData.find(c => c.id === user.companyUsersId);
        return {
          ...user,
          entreprise: company ? company.name : 'N/A'
        };
      });
      
      setUsers(usersWithCompanies);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({
        title: "Erreur",
        description: "Erreur lors de la récupération des données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const searchFields = [
    { id: "nom", label: "Nom Utilisateur" },
    { 
      id: "entreprise", 
      label: "Entreprise", 
      type: "select",
      options: companies.map(company => ({
        value: company.name,
        label: company.name
      }))
    },
  ];

  const handleSearch = (formData: any) => {
    console.log("Searching with:", formData);
    // Implement search logic with UserService.fetchFilteredUsers
  };

  const handleEdit = (item: any) => {
    console.log("Edit item:", item);
    setSelectedUser(item);
    setEditDialogOpen(true);
  };

  const handleDelete = async (item: any) => {
    try {
      await UserService.deleteUserData(item);
      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur ${item.nom} a été supprimé avec succès.`
      });
      await fetchData();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const handleAdd = () => {
    console.log("Add new item");
    // Implement add logic
  };
  
  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
    fetchData();
    toast({
      title: "Modification réussie",
      description: "Les informations de l'utilisateur ont été mises à jour avec succès"
    });
  };

  const renderActions = (item: any) => {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <DeleteConfirmationDialog
          title="Supprimer l'utilisateur"
          description={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${item.nom}" ? Cette action ne peut pas être annulée.`}
          onConfirm={() => handleDelete(item)}
        />
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Utilisateurs</h1>
      
      <SearchForm
        fields={searchFields}
        onSubmit={handleSearch}
        onReset={() => fetchData()}
        onAdd={handleAdd}
      />
      
      <EnhancedDataTable
        columns={columns}
        data={users}
        renderActions={renderActions}
        loading={loading}
        enablePagination={true}
        defaultItemsPerPage={50}
      />
      
      {/* Dialog pour éditer un utilisateur */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur sélectionné.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onClose={() => setEditDialogOpen(false)}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
