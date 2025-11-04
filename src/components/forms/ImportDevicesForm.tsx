
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Eye, EyeOff, FileSpreadsheet, AlertCircle, Package, PackageCheck } from "lucide-react";
import { CompanySearchSelect } from "@/components/ui/company-search-select";
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { createDeviceSimple } from "@/services/SimpleDeviceService";
import * as XLSX from 'xlsx';

type DeviceData = {
  imei: string;
  sim: string;
  telephone: string;
  immatriculation?: string; // Optional - if present, create vehicle + association
}

interface ImportDevicesFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ImportDevicesForm({ onClose, onSuccess }: ImportDevicesFormProps) {
  const [importMode, setImportMode] = useState<"libre" | "complete">("libre");
  const [clientSelected, setClientSelected] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<DeviceData[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
    existingDevices: Array<{ imei: string; currentVehicle?: string; newVehicle?: string }>;
  } | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  
  // Reset file and data when mode changes
  useEffect(() => {
    setFile(null);
    setPreviewData([]);
    setIsPreviewVisible(false);
    setImportResults(null);
    setShowOverwriteConfirm(false);
  }, [importMode]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Parse the Excel file and generate preview data
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
        
        // Get header row to validate format
        const headers = sheetData[0] as any[];
        const expectedColumns = importMode === "complete" ? 4 : 3;
        
        if (headers.length < expectedColumns) {
          toast({
            title: "Erreur de format",
            description: importMode === "complete" 
              ? "Le fichier doit contenir les colonnes: IMEI, SIM, Téléphone, Immatriculation"
              : "Le fichier doit contenir les colonnes: IMEI, SIM, Téléphone",
            variant: "destructive",
          });
          setFile(null);
          return;
        }
        
        // Skip header row and transform data
        const transformedData: DeviceData[] = sheetData.slice(1).map((row: any) => ({
          imei: row[0]?.toString() || '',
          sim: row[1]?.toString() || '',
          telephone: row[2]?.toString() || '',
          immatriculation: importMode === "complete" ? (row[3]?.toString() || '') : undefined
        })).filter(device => device.imei); // Filter out empty rows
        
        setPreviewData(transformedData);
        setIsPreviewVisible(true);
        
        console.log('Parsed Excel data:', transformedData);
        console.log('Import mode:', importMode);
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
  
  const handleImport = async (forceOverwrite = false) => {
    // Company selection is only required for complete import mode
    if (importMode === "complete" && !clientSelected) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une entreprise pour l'importation complète",
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
    setShowOverwriteConfirm(false);
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      existingDevices: [] as Array<{ imei: string; currentVehicle?: string; newVehicle?: string }>
    };
    
    try {
      console.log("Starting import, mode:", importMode);
      console.log("Company:", clientSelected);
      console.log("Items to import:", previewData.length);
      console.log("Force overwrite:", forceOverwrite);
      
      const { checkImeiAvailable } = await import('@/services/SimpleDeviceService');
      const { createVehicleSimple } = await import('@/services/SimpleVehicleService');
      const { associateDeviceToVehicleUnique } = await import('@/services/DeviceUniqueAssociationService');
      const { createTrame } = await import('@/graphql/mutations');
      const { getLazyClient } = await import('@/config/aws-config');
      
      // Process devices sequentially
      for (let i = 0; i < previewData.length; i++) {
        const item = previewData[i];
        
        try {
          // Check if device already exists
          const isAvailable = await checkImeiAvailable(item.imei);
          
          if (!isAvailable && !forceOverwrite) {
            // Device exists and we're not forcing overwrite
            results.existingDevices.push({
              imei: item.imei,
              newVehicle: item.immatriculation
            });
            console.log(`Device ${item.imei} already exists, skipping`);
            continue;
          }
          
          // Create or get device
          let device;
          if (isAvailable) {
            device = await createDeviceSimple({
              imei: item.imei,
              sim: item.sim || undefined,
              enabled: true
            });
            console.log(`Device ${item.imei} created`);
          }
          
          // If complete import mode, create vehicle and associate
          if (importMode === "complete" && item.immatriculation && clientSelected) {
            // Create vehicle
            const vehicle = await createVehicleSimple({
              immatriculation: item.immatriculation,
              companyVehiclesId: clientSelected,
              nomVehicule: item.immatriculation
            });
            console.log(`Vehicle ${item.immatriculation} created`);
            
            // Associate device to vehicle (this handles Device, Vehicle, and Trame tables)
            await associateDeviceToVehicleUnique(item.imei, item.immatriculation, forceOverwrite);
            console.log(`Device ${item.imei} associated to vehicle ${item.immatriculation}`);
          }
          
          results.success++;
          console.log(`Item ${i + 1} imported successfully`);
        } catch (error) {
          results.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`${item.imei}${item.immatriculation ? ' (' + item.immatriculation + ')' : ''}: ${errorMsg}`);
          console.error(`Failed to import item ${i + 1}:`, error);
        }
        
        // Update progress
        const progress = ((i + 1) / previewData.length) * 100;
        setImportProgress(progress);
      }
      
      setImportResults(results);
      
      // If we have existing devices and not forcing overwrite, show confirmation
      if (results.existingDevices.length > 0 && !forceOverwrite) {
        setShowOverwriteConfirm(true);
        toast({
          title: "Boîtiers existants détectés",
          description: `${results.existingDevices.length} boîtier(s) existent déjà. Voulez-vous écraser les associations?`,
          variant: "default",
        });
      } else {
        // Show summary toast
        const message = importMode === "complete"
          ? `${results.success} boîtiers et véhicules importés avec succès.`
          : `${results.success} boîtiers libres importés avec succès.`;
        
        toast({
          title: "Import terminé",
          description: `${message} ${results.failed} échecs.`,
          variant: results.failed === 0 ? "default" : "destructive",
        });
        
        // Call onSuccess callback and close dialog
        if (results.failed === 0 && results.existingDevices.length === 0) {
          if (onSuccess) onSuccess();
          setTimeout(() => {
            if (onClose) onClose();
          }, 2000);
        }
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
        <DialogTitle>Importer des Boîtiers</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Import Mode Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Mode d'importation
          </label>
          <RadioGroup value={importMode} onValueChange={(value: "libre" | "complete") => setImportMode(value)}>
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="libre" id="libre" />
              <Label htmlFor="libre" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Boîtiers libres</div>
                    <div className="text-xs text-muted-foreground">Import simple de boîtiers (IMEI, SIM, Téléphone)</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="complete" id="complete" />
              <Label htmlFor="complete" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Importation complète</div>
                    <div className="text-xs text-muted-foreground">Création de boîtiers + véhicules + associations (IMEI, SIM, Téléphone, Immatriculation)</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Company Selection - Only for complete mode */}
        {importMode === "complete" && (
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
        )}

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
            {importMode === "complete"
              ? "Format: Excel (.xlsx, .xls) avec colonnes IMEI, SIM, Téléphone, Immatriculation"
              : "Format: Excel (.xlsx, .xls) avec colonnes IMEI, SIM, Téléphone"}
          </p>
          {importMode === "complete" && (
            <Alert className="mt-2 border-primary/50 bg-primary/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Mode complet activé:</strong> Création automatique des boîtiers, véhicules et associations (Device, Vehicle, Trame)
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {file && (
          <div className="bg-muted/40 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
                <span className="text-sm text-muted-foreground">
                  ({previewData.length} {importMode === "complete" ? 'boîtiers + véhicules' : 'boîtiers'})
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
                      <TableHead>IMEI</TableHead>
                      <TableHead>Numéro SIM</TableHead>
                      <TableHead>Numéro de Téléphone</TableHead>
                      {importMode === "complete" && <TableHead>Immatriculation</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((device, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{device.imei}</TableCell>
                        <TableCell className="font-mono text-sm">{device.sim}</TableCell>
                        <TableCell>{device.telephone}</TableCell>
                        {importMode === "complete" && <TableCell className="font-semibold">{device.immatriculation}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
        
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
        
        {importResults && (
          <Alert className={importResults.failed > 0 || importResults.existingDevices.length > 0 ? "border-yellow-500" : "border-green-500"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Import terminé:</strong> {importResults.success} succès, {importResults.failed} échecs
                </p>
                {importResults.existingDevices.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border-t pt-2 mt-2">
                    <p className="text-sm font-medium text-yellow-600">Boîtiers existants ({importResults.existingDevices.length}):</p>
                    <ul className="text-xs space-y-1">
                      {importResults.existingDevices.slice(0, 5).map((item, index) => (
                        <li key={index} className="text-yellow-700">
                          {item.imei} {item.newVehicle && `→ ${item.newVehicle}`}
                        </li>
                      ))}
                      {importResults.existingDevices.length > 5 && (
                        <li className="text-muted-foreground">
                          ... et {importResults.existingDevices.length - 5} autres
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {importResults.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border-t pt-2 mt-2">
                    <p className="text-sm font-medium text-destructive">Erreurs:</p>
                    <ul className="text-xs space-y-1">
                      {importResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-destructive">{error}</li>
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
        
        {showOverwriteConfirm && importResults && importResults.existingDevices.length > 0 && (
          <Alert className="border-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Voulez-vous écraser les associations existantes?</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleImport(true)}
                  disabled={isImporting}
                >
                  Oui, écraser
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowOverwriteConfirm(false)}
                >
                  Non, annuler
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </DialogClose>
          <Button 
            onClick={() => handleImport(false)} 
            disabled={!file || (importMode === "complete" && !clientSelected) || isImporting || previewData.length === 0}
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Valider l'import ({previewData.length} {importMode === "complete" ? 'boîtiers + véhicules' : 'boîtiers'})
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
