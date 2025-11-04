
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileCheck } from "lucide-react";

interface FirmwareUploadProps {
  onUpload: (file: File, metadata: any) => void;
}

export function FirmwareUpload({ onUpload }: FirmwareUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    deviceModel: "",
    description: "",
    status: "testing"
  });

  const deviceModels = [
    "FMB140", "FMC130", "FMB120", "FMB110", "FMC125", "FMB010", "FMB003"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill name from filename
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: selectedFile.name.replace(/\.[^/.]+$/, "")
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file, formData);
      // Reset form
      setFile(null);
      setFormData({
        name: "",
        version: "",
        deviceModel: "",
        description: "",
        status: "testing"
      });
      // Reset file input
      const fileInput = document.getElementById('firmware-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firmware-file">Fichier Firmware</Label>
          <Input
            id="firmware-file"
            type="file"
            accept=".bin,.hex,.fw"
            onChange={handleFileChange}
            required
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <FileCheck className="h-4 w-4" />
              {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nom du Firmware</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: FMB140 Standard"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={formData.version}
            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
            placeholder="Ex: 03.28.07.Rev.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deviceModel">Modèle d'Équipement</Label>
          <Select
            value={formData.deviceModel}
            onValueChange={(value) => setFormData(prev => ({ ...prev, deviceModel: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un modèle" />
            </SelectTrigger>
            <SelectContent>
              {deviceModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Statut Initial</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="testing">Test</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Décrivez les améliorations et changements de ce firmware..."
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Téléchargement en cours...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Télécharger le Firmware
          </>
        )}
      </Button>
    </form>
  );
}
