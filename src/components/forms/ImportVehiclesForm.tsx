import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Eye, EyeOff, FileSpreadsheet, AlertCircle } from "lucide-react";
import { CompanySearchSelect } from "@/components/ui/company-search-select";
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

type VehicleData = {
  immatriculation: string;
  marque: string;
  nomVehicule: string;
  kilometerage: string;
}

interface ImportVehiclesFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ImportVehiclesForm({ onClose, onSuccess }: ImportVehiclesFormProps) {
  const [clientSelected, setClientSelected] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<VehicleData[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    skipped: number;
    errors: string[];
    existingVehicles: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Validate header
        const headers = sheetData[0] as any[];
        if (headers.length < 4) {
          toast({
            title: "Erreur de format",
            description: "Le fichier doit contenir les colonnes: Immatriculation, Marque, Nom Véhicule, Kilométrage",
            variant: "destructive",
          });
          setFile(null);
          return;
        }
        
        // Transform data (skip header)
        const transformedData: VehicleData[] = sheetData.slice(1)
          .map((row: any) => ({
            immatriculation: row[0]?.toString()?.trim() || '',
            marque: row[1]?.toString()?.trim() || '',
            nomVehicule: row[2]?.toString()?.trim() || '',
            kilometerage: row[3]?.toString()?.trim() || '',
          }))
          .filter(vehicle => vehicle.immatriculation); // Filter empty rows
        
        setPreviewData(transformedData);
        setIsPreviewVisible(true);
        
        console.log('Parsed Excel data:', transformedData);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors de l'analyse du fichier Excel",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!clientSelected) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une entreprise",
        variant: "destructive",
      });
      return;
    }
    
    if (!file || previewData.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner un fichier Excel valide",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    setImportProgress(0);
    
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
      existingVehicles: [] as string[]
    };
    
    try {
      console.log("Starting vehicle import");
      console.log("Company:", clientSelected);
      console.log("Vehicles to import:", previewData.length);
      
      const { checkVehicleExists, createVehicleSimple } = await import('@/services/SimpleVehicleService');
      
      // Process vehicles sequentially
      for (let i = 0; i < previewData.length; i++) {
        const item = previewData[i];
        
        try {
          // Check if vehicle already exists
          const exists = await checkVehicleExists(item.immatriculation);
          
          if (exists) {
            results.skipped++;
            results.existingVehicles.push(item.immatriculation);
            console.log(`Vehicle ${item.immatriculation} already exists, skipping`);
          } else {
            // Create vehicle
            await createVehicleSimple({
              immatriculation: item.immatriculation,
              companyVehiclesId: clientSelected,
              nomVehicule: item.nomVehicule || item.immatriculation,
              marque: item.marque,
              kilometerage: item.kilometerage
            });
            results.success++;
            console.log(`Vehicle ${item.immatriculation} created`);
          }
        } catch (error) {
          results.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`${item.immatriculation}: ${errorMsg}`);
          console.error(`Failed to import vehicle ${item.immatriculation}:`, error);
        }
        
        // Update progress
        const progress = ((i + 1) / previewData.length) * 100;
        setImportProgress(progress);
      }
      
      setImportResults(results);
      
      // Show summary toast
      const message = results.skipped > 0
        ? `${results.success} véhicules créés, ${results.skipped} déjà existants (ignorés).`
        : `${results.success} véhicules créés avec succès.`;
      
      toast({
        title: "Import terminé",
        description: `${message} ${results.failed} échecs.`,
        variant: results.failed === 0 ? "default" : "destructive",
      });
      
      // Call onSuccess callback and close dialog
      if (results.failed === 0) {
        if (onSuccess) onSuccess();
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Import process failed:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du processus d'import",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
  };

  return (
    <>
      <DialogHeader className="mb-5">
        <DialogTitle>Importer des Véhicules</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Company Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Entreprise (Obligatoire)
          </label>
          <CompanySearchSelect 
            value={clientSelected}
            onValueChange={setClientSelected}
            placeholder="Sélectionner une entreprise"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Fichier Excel
          </label>
          <div className="flex items-center gap-2">
            <Input 
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Format: Excel (.xlsx, .xls) avec les colonnes: Immatriculation, Marque, Nom Véhicule, Kilométrage
          </p>
          <Alert className="mt-2 border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Les véhicules déjà existants seront ignorés et ne seront pas recréés.
            </AlertDescription>
          </Alert>
        </div>
        
        {/* File Preview */}
        {file && (
          <div className="bg-muted/40 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
                <span className="text-sm text-muted-foreground">
                  ({previewData.length} véhicules)
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={togglePreview} 
                className="flex items-center"
              >
                {isPreviewVisible ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Masquer l'aperçu
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir l'aperçu
                  </>
                )}
              </Button>
            </div>
            
            {isPreviewVisible && (
              <div className="border rounded-md mt-2 overflow-x-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Immatriculation</TableHead>
                      <TableHead>Marque</TableHead>
                      <TableHead>Nom Véhicule</TableHead>
                      <TableHead>Kilométrage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-semibold">{vehicle.immatriculation}</TableCell>
                        <TableCell>{vehicle.marque}</TableCell>
                        <TableCell>{vehicle.nomVehicule}</TableCell>
                        <TableCell>{vehicle.kilometerage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
        
        {/* Import Progress */}
        {isImporting && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Import en cours...</span>
            </div>
            <Progress value={importProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {Math.round(importProgress)}% - Ne fermez pas cette fenêtre
            </p>
          </div>
        )}
        
        {/* Import Results */}
        {importResults && (
          <Alert className={importResults.failed > 0 || importResults.skipped > 0 ? "border-yellow-500" : "border-green-500"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Import terminé:</strong> {importResults.success} créés, {importResults.skipped} ignorés (déjà existants), {importResults.failed} échecs
                </p>
                {importResults.existingVehicles.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border-t pt-2 mt-2">
                    <p className="text-sm font-medium text-yellow-600">Véhicules existants ({importResults.existingVehicles.length}):</p>
                    <ul className="text-xs space-y-1">
                      {importResults.existingVehicles.slice(0, 10).map((immat, index) => (
                        <li key={index} className="text-yellow-700">
                          {immat}
                        </li>
                      ))}
                      {importResults.existingVehicles.length > 10 && (
                        <li className="text-muted-foreground">
                          ... et {importResults.existingVehicles.length - 10} autres
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {importResults.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border-t pt-2 mt-2">
                    <p className="text-sm font-medium text-red-600">Erreurs:</p>
                    <ul className="text-xs space-y-1">
                      {importResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-red-700">
                          {error}
                        </li>
                      ))}
                      {importResults.errors.length > 5 && (
                        <li className="text-muted-foreground">
                          ... et {importResults.errors.length - 5} autres erreurs
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-6">
        <DialogClose asChild>
          <Button variant="outline" disabled={isImporting}>
            Annuler
          </Button>
        </DialogClose>
        <Button 
          onClick={handleImport}
          disabled={isImporting || !file || !clientSelected}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? "Import en cours..." : "Valider l'import"}
        </Button>
      </div>
    </>
  );
}
