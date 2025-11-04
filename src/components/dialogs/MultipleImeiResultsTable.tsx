
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CopyableCell } from "@/components/tables/CopyableCell";

interface Device {
  imei: string;
  typeBoitier?: string;
  sim?: string;
  telephone?: string;
  entreprise: string;
  emplacement?: string;
  type: string;
  [key: string]: any;
}

interface MultipleImeiResultsTableProps {
  devices: Device[];
  onSelectionChange: (selectedDevices: Device[]) => void;
}

export function MultipleImeiResultsTable({ devices, onSelectionChange }: MultipleImeiResultsTableProps) {
  const [selectedRows, setSelectedRows] = useState<{[key: string]: boolean}>({});
  const [selectAll, setSelectAll] = useState(false);

  const columns = [
    { id: "imei", label: "IMEI" },
    { id: "typeBoitier", label: "Type de Boîtier" },
    { id: "sim", label: "SIM" },
    { id: "entreprise", label: "Entreprise" },
    { id: "emplacement", label: "Emplacement" }
  ];

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    
    if (checked) {
      // Sélectionner tous les appareils
      const newSelectedRows: {[key: string]: boolean} = {};
      devices.forEach(device => {
        newSelectedRows[device.imei] = true;
      });
      setSelectedRows(newSelectedRows);
      onSelectionChange(devices);
    } else {
      // Désélectionner tous les appareils
      setSelectedRows({});
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (device: Device, checked: boolean) => {
    const newSelectedRows = { ...selectedRows, [device.imei]: checked };
    setSelectedRows(newSelectedRows);
    
    // Mettre à jour l'état de sélection globale
    const allSelected = devices.every(d => newSelectedRows[d.imei]);
    setSelectAll(allSelected);
    
    // Envoyer les appareils sélectionnés au parent
    const selectedDevices = devices.filter(d => newSelectedRows[d.imei]);
    onSelectionChange(selectedDevices);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectAll} 
                onCheckedChange={handleSelectAll} 
                aria-label="Sélectionner tous les appareils"
              />
            </TableHead>
            {columns.map((column) => (
              <TableHead key={column.id}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.imei}>
              <TableCell>
                <Checkbox 
                  checked={!!selectedRows[device.imei]} 
                  onCheckedChange={(checked) => handleSelectRow(device, !!checked)}
                  aria-label={`Sélectionner ${device.imei}`}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  <CopyableCell value={device[column.id]} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
