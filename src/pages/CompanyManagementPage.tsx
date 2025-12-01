import { CompanyUsersList } from "@/components/CompanyUsersList";
import { CompanyVehiclesDialog } from "@/components/dialogs/CompanyVehiclesDialog";
import { DeleteConfirmationDialog } from "@/components/dialogs/DeleteConfirmationDialog";
import AddCompanyForm from "@/components/forms/AddCompanyForm";
import EditCompanyForm from "@/components/forms/EditCompanyForm";
import { EnhancedDataTable } from "@/components/tables/EnhancedDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useInfiniteCompanies } from "@/hooks/useInfiniteCompanies";
import * as CompanyService from "@/services/CompanyService";
import { ArrowUp, Building, Car, Loader2, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function CompanyManagementPage() {
  // Use infinite scroll hook
  const {
    companies,
    loading,
    hasMore,
    loadMore,
    reset,
    searchByFilters,
    updateCompany
  } = useInfiniteCompanies();

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [vehiclesDialogOpen, setVehiclesDialogOpen] = useState(false);
  const [selectedCompanyForVehicles, setSelectedCompanyForVehicles] = useState<any>(null);

  // Search states
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchSiret, setSearchSiret] = useState('');
  const [activeFilters, setActiveFilters] = useState<{name?: string, email?: string, siret?: string}>({});
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Auto-load first batch on mount
  useEffect(() => {
    if (companies.length === 0 && !loading && hasMore) {
      loadMore();
    }
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Infinite scroll observer - disabled when filtered
  useEffect(() => {
    if (isFiltered) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log('Loading more companies...');
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore, isFiltered]);

  // Search companies with filters
  const handleSearch = async () => {
    if (!searchName && !searchEmail && !searchSiret) {
      toast({
        title: "Aucun filtre",
        description: "Veuillez saisir au moins un critère de recherche",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchByFilters(searchName, searchEmail, searchSiret);
      setActiveFilters({
        ...(searchName && { name: searchName }),
        ...(searchEmail && { email: searchEmail }),
        ...(searchSiret && { siret: searchSiret }),
      });
      setIsFiltered(true);
      toast({
        title: "Recherche réussie",
        description: `${results.length} entreprise(s) trouvée(s)`
      });
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la recherche",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Reset search
  const handleReset = useCallback(() => {
    setSearchName('');
    setSearchEmail('');
    setSearchSiret('');
    setActiveFilters({});
    setIsFiltered(false);
    reset();
    loadMore();
  }, [reset, loadMore]);

  // Update company
  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedCompany: any) => {
    setEditDialogOpen(false);
    setSelectedItem(null);
    if (updateCompany) {
      updateCompany(updatedCompany);
    }
    toast({
      title: "Modification réussie",
      description: "Les informations ont été mises à jour avec succès"
    });
  };

  // Delete company and associated users
  const handleDelete = async (item) => {
    try {
      await CompanyService.deleteCompanyAndUser(item);
      toast({
        title: "Succès",
        description: "Entreprise et utilisateurs supprimés avec succès"
      });
      handleReset();
    } catch (err) {
      console.error('Error deleting company:', err);
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const handleAddSuccess = () => {
    setIsDialogOpen(false);
    handleReset();
    toast({
      title: "Ajout réussi",
      description: "L'entreprise et l'utilisateur ont été créés avec succès"
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewVehicles = (company: any) => {
    // Récupérer la company depuis la liste à jour pour avoir le dernier statut ANTAI
    const updatedCompany = companies.find(c => c.id === company.id) || company;
    setSelectedCompanyForVehicles(updatedCompany);
    setVehiclesDialogOpen(true);
  };

  // Define columns for the table
  const columns = [
    {
      id: "name",
      label: "Entreprise",
      sortable: true,
      visible: true,
      renderCell: (value, row) => (
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium">{value}</span>
            <CompanyUsersList companyName="" companyId={row.id} />
          </div>
        </div>
      )
    },
    {
      id: "contact",
      label: "Contact",
      sortable: true,
      visible: true,
      renderCell: (value) => (
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {value || "Non renseigné"}
        </span>
      )
    },
    {
      id: "email",
      label: "Email",
      sortable: true,
      visible: true,
      renderCell: (value) => (
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {value || "Non renseigné"}
        </span>
      )
    },
    {
      id: "mobile",
      label: "Téléphone",
      sortable: true,
      visible: true,
      renderCell: (value) => (
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {value || "Non renseigné"}
        </span>
      )
    },
    {
      id: "city",
      label: "Ville",
      sortable: true,
      visible: true,
      renderCell: (value) => (
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {value || "Non renseignée"}
        </span>
      )
    },
    {
      id: "siret",
      label: "SIRET",
      sortable: true,
      visible: false,
      renderCell: (value) => (
        <span className={!value ? "text-muted-foreground italic" : "font-mono text-sm"}>
          {value || "Non renseigné"}
        </span>
      )
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      visible: true,
      renderCell: (value: any, row: any) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewVehicles(row)}
            title="Voir les véhicules"
          >
            <Car className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row)}
            title="Modifier l'entreprise"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog
            title="Supprimer l'entreprise"
            description={`Êtes-vous sûr de vouloir supprimer l'entreprise "${row.name}" ? Cette action supprimera également tous les utilisateurs associés et ne peut pas être annulée.`}
            onConfirm={() => handleDelete(row)}
            trigger={
              <Button variant="outline" size="icon" title="Supprimer l'entreprise">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            Gestion des Entreprises
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos entreprises et leurs utilisateurs
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle entreprise
            </Button>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <AddCompanyForm onClose={() => setIsDialogOpen(false)} onSuccess={handleAddSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Filtres de recherche</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="searchName">Nom de l'entreprise</Label>
            <Input
              id="searchName"
              placeholder="Rechercher par nom..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="searchEmail">Email</Label>
            <Input
              id="searchEmail"
              type="email"
              placeholder="Rechercher par email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="searchSiret">SIRET</Label>
            <Input
              id="searchSiret"
              placeholder="Rechercher par SIRET..."
              value={searchSiret}
              onChange={(e) => setSearchSiret(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {isFiltered && Object.keys(activeFilters).length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Filtres actifs:</span>
            {activeFilters.name && (
              <Badge variant="secondary" className="gap-1">
                Nom: {activeFilters.name}
              </Badge>
            )}
            {activeFilters.email && (
              <Badge variant="secondary" className="gap-1">
                Email: {activeFilters.email}
              </Badge>
            )}
            {activeFilters.siret && (
              <Badge variant="secondary" className="gap-1">
                SIRET: {activeFilters.siret}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleSearch}
            disabled={searchLoading || (!searchName && !searchEmail && !searchSiret)}
          >
            <Search className="h-4 w-4 mr-2" />
            {searchLoading ? "Recherche..." : "Filtrer"}
          </Button>
          {isFiltered && (
            <Button variant="outline" onClick={handleReset}>
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {loading ? "Chargement..." : `${companies.length} entreprise(s) trouvée(s)`}
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-lg">
        <EnhancedDataTable
          columns={columns}
          data={companies}
          loading={loading && companies.length === 0}
          enablePagination={false}
        />
      </div>

      {/* Infinite scroll trigger - only show when not in filtered mode */}
      {!isFiltered && (
        <div 
          ref={observerTarget} 
          className="flex justify-center py-6"
        >
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Chargement de 50 entreprises supplémentaires...</span>
            </div>
          )}
          {!hasMore && companies.length > 0 && (
            <p className="text-muted-foreground text-sm">
              ✓ Toutes les entreprises ont été chargées ({companies.length} au total)
            </p>
          )}
          {companies.length === 0 && !loading && (
            <p className="text-muted-foreground text-sm">
              Aucune entreprise trouvée
            </p>
          )}
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg animate-fade-in z-50"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Edit Company Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <EditCompanyForm 
              company={selectedItem} 
              onClose={() => setEditDialogOpen(false)} 
              onSuccess={handleEditSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Company Vehicles Dialog */}
      <CompanyVehiclesDialog
        open={vehiclesDialogOpen}
        onOpenChange={setVehiclesDialogOpen}
        companyId={selectedCompanyForVehicles?.id || ""}
        companyName={selectedCompanyForVehicles?.name || ""}
        haveAntai={selectedCompanyForVehicles?.haveAntai || false}
        hasAntaiSubscription={selectedCompanyForVehicles?.hasAntaiSubscription || false}
        onAntaiStatusChange={(companyId, haveAntai) => {
          // Mettre à jour l'état local de la company sélectionnée
          setSelectedCompanyForVehicles(prev => 
            prev ? { ...prev, haveAntai } : null
          );
          // Mettre à jour la company dans la liste
          const updatedCompany = companies.find(c => c.id === companyId);
          if (updatedCompany) {
            updateCompany({ ...updatedCompany });
          }
        }}
      />
    </div>
  );
}
