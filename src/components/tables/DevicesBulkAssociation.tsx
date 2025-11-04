import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanySearchSelect } from "@/components/ui/company-search-select";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import { toast } from "@/hooks/use-toast";
import { Wifi, Building, Check, Trash2, Search } from "lucide-react";
import * as CompanyDeviceService from "@/services/CompanyDeviceService";
import { deleteDevice } from "@/services/SimpleDeviceService";

interface DevicesBulkAssociationProps {
  devices: any[];
  onAssociationComplete: () => void;
}

export const DevicesBulkAssociation = ({ devices, onAssociationComplete }: DevicesBulkAssociationProps) => {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isAssociating, setIsAssociating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Filter devices based on search term
  const filteredDevices = useMemo(() => {
    if (!searchTerm) return devices;

    // Multi-IMEI aware search: supports ; , | tab newline spaces and concatenated 15-digit blocks
    let tokens = searchTerm
      .split(/[^0-9A-Za-zÀ-ÿ]+/)
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    // If single numeric token looks like concatenated IMEIs (15n digits), split into 15-digit chunks
    const isConcat = tokens.length === 1 && /^\d+$/.test(tokens[0]) && tokens[0].length >= 30 && tokens[0].length % 15 === 0;
    if (isConcat) {
      const t = tokens[0];
      const chunks: string[] = [];
      for (let i = 0; i < t.length; i += 15) chunks.push(t.slice(i, i + 15));
      tokens = chunks;
    }

    // If multiple tokens (likely multi-IMEI), match any token on IMEI only for precision
    if (tokens.length > 1) {
      return devices.filter(device => {
        const imei = (device.imei || '').toLowerCase();
        if (!imei) return false;
        return tokens.some(tok => imei.includes(tok));
      });
    }

    const term = tokens[0];
    return devices.filter(device =>
      (device.imei?.toLowerCase().includes(term)) ||
      (device.typeBoitier?.toLowerCase().includes(term)) ||
      (device.telephone?.toLowerCase().includes(term)) ||
      (device.entreprise?.toLowerCase().includes(term))
    );
  }, [devices, searchTerm]);

  // Paginate filtered devices
  const paginatedDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDevices.slice(startIndex, endIndex);
  }, [filteredDevices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Toggle individual device selection
  const toggleDeviceSelection = (deviceImei: string) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceImei)) {
        return prev.filter(imei => imei !== deviceImei);
      } else {
        return [...prev, deviceImei];
      }
    });
  };

  // Toggle all devices selection
  const toggleAllDevices = () => {
    if (selectedDevices.length === devices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devices.map(device => device.imei));
    }
  };

  // Delete selected devices
  const handleBulkDelete = async () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un boîtier à supprimer",
        variant: "destructive"
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedDevices.length} boîtier(s) ? Cette action est irréversible.`
    );

    if (!confirmDelete) return;

    setIsAssociating(true);

    try {
      const results = [];
      const errors = [];

      for (const deviceImei of selectedDevices) {
        try {
          await deleteDevice(deviceImei);
          results.push(deviceImei);
        } catch (error) {
          console.error(`Error deleting device ${deviceImei}:`, error);
          errors.push({ deviceImei, error: error.message });
        }
      }

      if (errors.length === 0) {
        toast({
          title: "Succès",
          description: `${results.length} boîtier(s) supprimé(s) avec succès`
        });
      } else {
        toast({
          title: "Partiellement réussi",
          description: `${results.length} supprimé(s), ${errors.length} échec(s)`,
          variant: "default"
        });
      }

      // Reset selections
      setSelectedDevices([]);
      
      // Notify parent to refresh data
      onAssociationComplete();

    } catch (error) {
      console.error('Error in bulk deletion:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression en masse",
        variant: "destructive"
      });
    } finally {
      setIsAssociating(false);
    }
  };

  // Associate selected devices to company
  const handleBulkAssociation = async () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un boîtier",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCompany) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une entreprise",
        variant: "destructive"
      });
      return;
    }

    setIsAssociating(true);

    try {
      const results = [];
      const errors = [];

      for (const deviceImei of selectedDevices) {
        try {
          await CompanyDeviceService.reserveDeviceForCompany(deviceImei, selectedCompany);
          results.push(deviceImei);
        } catch (error) {
          console.error(`Error associating device ${deviceImei}:`, error);
          errors.push({ deviceImei, error: error.message });
        }
      }

      if (errors.length === 0) {
        toast({
          title: "Succès",
          description: `${results.length} boîtier(s) associé(s) avec succès à l'entreprise`
        });
      } else {
        toast({
          title: "Partiellement réussi",
          description: `${results.length} réussi(s), ${errors.length} échec(s)`,
          variant: "default"
        });
      }

      // Reset selections
      setSelectedDevices([]);
      setSelectedCompany("");
      
      // Notify parent to refresh data
      onAssociationComplete();

    } catch (error) {
      console.error('Error in bulk association:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'association en masse",
        variant: "destructive"
      });
    } finally {
      setIsAssociating(false);
    }
  };

  const allSelected = selectedDevices.length === devices.length;
  const someSelected = selectedDevices.length > 0 && selectedDevices.length < devices.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wifi className="h-5 w-5 text-green-600" />
          Boîtiers sans IMEI ({filteredDevices.length})
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-600" />
            <CompanySearchSelect
              value={selectedCompany}
              onValueChange={setSelectedCompany}
              placeholder="Sélectionner une entreprise..."
              className="w-64"
            />
          </div>
          
          <Button
            onClick={handleBulkAssociation}
            disabled={selectedDevices.length === 0 || !selectedCompany || isAssociating}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Associer ({selectedDevices.length})
          </Button>
          
          <Button
            onClick={handleBulkDelete}
            disabled={selectedDevices.length === 0 || isAssociating}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer ({selectedDevices.length})
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher par IMEI, protocole, SIM ou entreprise..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAllDevices}
                />
              </TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>SIM</TableHead>
              <TableHead>Entreprise actuelle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDevices.map((device) => (
              <TableRow key={device.imei}>
                <TableCell>
                  <Checkbox
                    checked={selectedDevices.includes(device.imei)}
                    onCheckedChange={() => toggleDeviceSelection(device.imei)}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {device.imei}
                </TableCell>
                <TableCell>
                  {device.typeBoitier || "N/A"}
                </TableCell>
                <TableCell>
                  {device.telephone || "N/A"}
                </TableCell>
                <TableCell>
                  <span className="text-gray-500 italic">
                    {device.entreprise || "Aucune"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <EnhancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDevices.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={() => {}} // Fixed at 50 per page
        />
      )}

      {selectedDevices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {selectedDevices.length} boîtier(s) sélectionné(s) pour association
            {selectedCompany && (
              <span className="font-medium"> à l'entreprise sélectionnée</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};