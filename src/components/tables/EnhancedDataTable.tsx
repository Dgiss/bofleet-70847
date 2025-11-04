
import React, { useState, useMemo, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Eye, EyeOff, Filter, Link, Search, Trash, Unlink } from "lucide-react";
import { CopyableCell } from "./CopyableCell";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  renderCell?: (value: any, row: any) => React.ReactNode;
}

interface EnhancedDataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onAssociate?: (item: any) => void;
  onDissociate?: (item: any) => void;
  renderActions?: (item: any) => React.ReactNode;
  loading?: boolean;
  enablePagination?: boolean;
  defaultItemsPerPage?: number;
  selectedVehicles?: string[];
  selectedDevices?: string[];
  isSelectMode?: boolean;
  isDeviceSelectMode?: boolean;
}

export function EnhancedDataTable({ 
  columns: initialColumns, 
  data, 
  onEdit, 
  onDelete, 
  onAssociate,
  onDissociate,
  renderActions,
  loading = false,
  enablePagination = false,
  defaultItemsPerPage = 50,
  selectedVehicles = [],
  selectedDevices = [],
  isSelectMode = false,
  isDeviceSelectMode = false
}: EnhancedDataTableProps) {
  const [columns, setColumns] = useState<Column[]>(
    initialColumns.map(col => ({ ...col, visible: col.visible !== undefined ? col.visible : true }))
  );
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [searchColumn, setSearchColumn] = useState<string>(columns[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const visibleColumns = useMemo(() => {
    return columns.filter(column => column.visible);
  }, [columns]);

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(
      columns.map((column) =>
        column.id === columnId ? { ...column, visible: !column.visible } : column
      )
    );
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: string) => {
    if (!sortConfig) return undefined;
    return sortConfig.key === key ? sortConfig.direction : undefined;
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    // Support multi-token search (comma, space, newline, semicolon, pipe, tab)
    let tokens = searchTerm
      .split(/[^0-9A-Za-zÀ-ÿ]+/)
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);
    
    // If a single numeric token looks like concatenated IMEIs (15n digits), chunk it
    const isConcatNumeric = tokens.length === 1 && /^\d+$/.test(tokens[0]) && tokens[0].length >= 30 && tokens[0].length % 15 === 0;
    if (isConcatNumeric) {
      const t = tokens[0];
      const chunks: string[] = [];
      for (let i = 0; i < t.length; i += 15) chunks.push(t.slice(i, i + 15));
      tokens = chunks;
    }
    
    // Auto-target IMEI column when the query looks like IMEI(s)
    const looksLikeImei = tokens.every(tok => /^\d{10,16}$/.test(tok));
    const hasImeiColumn = columns.some(c => c.id === 'imei');
    const effectiveColumn = looksLikeImei && hasImeiColumn ? 'imei' : searchColumn;
    
    return data.filter(item => {
      const value = item[effectiveColumn];
      if (value === null || value === undefined) return false;
      const str = String(value).toLowerCase();
      return tokens.length <= 1
        ? str.includes(tokens[0])
        : tokens.some(t => str.includes(t));
    });
  }, [data, searchTerm, searchColumn, columns]);

  // Sort data globally (before pagination)
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values for sorting
      if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;

      // Compare values
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data (after sorting)
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage, enablePagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const hasVisibleColumns = visibleColumns.length > 0;
  const displayData = enablePagination ? paginatedData : sortedData;

  // Disable virtualization to use page scroll
  const enableVirtual = false;
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: displayData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  });

  // Determine if the item is a device (for association button)
  const isDevice = (item: any) => item.type === 'device' || item.imei;
  
  // Determine if the item can be associated (only unassociated items)
  const canAssociate = (item: any) => {
    if (item.type === 'vehicle') {
      // Vehicle can be associated only if it has no IMEI/device
      return !item.imei || item.imei === '';
    }
    if (item.type === 'device') {
      // Device can be associated only if it has no vehicle
      return !item.vehicleImmat || item.vehicleImmat === '';
    }
    return false;
  };

  // Determine if the item can be dissociated (only associated items)
  const canDissociate = (item: any) => {
    if (item.type === 'vehicle') {
      // Vehicle can be dissociated only if it has an IMEI/device
      return item.imei && item.imei !== '';
    }
    if (item.type === 'device') {
      // Device can be dissociated only if it has a vehicle
      return item.vehicleImmat && item.vehicleImmat !== '';
    }
    return false;
  };

  // Determine if a row is selected
  const isRowSelected = (row: any) => {
    if (row.type === 'vehicle' && isSelectMode) {
      return selectedVehicles.includes(row.immatriculation || row.immat);
    }
    if (row.type === 'device' && isDeviceSelectMode) {
      return selectedDevices.includes(row.imei);
    }
    return false;
  };

  // Fonction pour rendre le contenu d'une cellule
  const renderCellContent = (column: Column, row: any) => {
    const value = row[column.id];
    
    // Utiliser le renderCell personnalisé s'il existe
    if (column.renderCell) {
      return column.renderCell(value, row);
    }
    
    // Sinon, utiliser le rendu par défaut (CopyableCell)
    return (
      <CopyableCell key={column.id} value={value} />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
      <div ref={parentRef} className="">
        <Table>
          <TableHeader>
              <TableRow>
                {hasVisibleColumns ? (
                  visibleColumns.map((column) => (
                    <TableHead 
                      key={column.id}
                      className={column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                      onClick={() => column.sortable && requestSort(column.id)}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        {column.label}
                        {column.sortable && (
                          <span className="ml-1">
                            {getSortDirection(column.id) === 'ascending' && '↑'}
                            {getSortDirection(column.id) === 'descending' && '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))
                ) : (
                  <TableHead>Aucune colonne sélectionnée</TableHead>
                )}
                 {(renderActions || onEdit || onDelete || onAssociate || onDissociate) && hasVisibleColumns && 
                  <TableHead className="w-24">Actions</TableHead>
                 }
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hasVisibleColumns ? visibleColumns.length + ((renderActions || onEdit || onDelete || onAssociate) ? 1 : 0) : 1} className="text-center py-4">
                    Aucune donnée disponible
                  </TableCell>
                </TableRow>
              ) : hasVisibleColumns ? (
                enableVirtual ? (
                  <>
                    {/* Top spacer */}
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + ((renderActions || onEdit || onDelete || onAssociate || onDissociate) ? 1 : 0)} style={{ height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0 }} />
                    </TableRow>
                    {rowVirtualizer.getVirtualItems().map(vi => {
                      const row = displayData[vi.index];
                      const selected = isRowSelected(row);
                      return (
                        <TableRow 
                          key={vi.key}
                          data-index={vi.index}
                          className={selected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                          style={{ height: vi.size }}
                        >
                          {visibleColumns.map((column) => (
                            <TableCell key={column.id}>
                              {renderCellContent(column, row)}
                            </TableCell>
                          ))}
                          {(renderActions || onEdit || onDelete || onAssociate || onDissociate) && (
                            <TableCell>
                              {renderActions ? (
                                renderActions(row)
                              ) : (
                                <div className="flex gap-1">
                                  {onEdit && (
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {onDelete && (
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(row)}>
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {onAssociate && canAssociate(row) && (
                                    <Button variant="ghost" size="icon" onClick={() => onAssociate(row)}>
                                      <Link className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {onDissociate && canDissociate(row) && (
                                    <Button variant="ghost" size="icon" onClick={() => onDissociate(row)}>
                                      <Unlink className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                    {/* Bottom spacer */}
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + ((renderActions || onEdit || onDelete || onAssociate || onDissociate) ? 1 : 0)} style={{ height: Math.max(0, rowVirtualizer.getTotalSize() - ((rowVirtualizer.getVirtualItems().at(-1)?.end) ?? 0)) }} />
                    </TableRow>
                  </>
                ) : (
                  displayData.map((row, index) => {
                    const selected = isRowSelected(row);
                    return (
                    <TableRow 
                      key={index}
                      className={selected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                    >
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id}>
                          {renderCellContent(column, row)}
                        </TableCell>
                      ))}
                       {(renderActions || onEdit || onDelete || onAssociate || onDissociate) && (
                         <TableCell>
                           {renderActions ? (
                             renderActions(row)
                           ) : (
                             <div className="flex gap-1">
                               {onEdit && (
                                 <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
                                   <Edit className="h-4 w-4" />
                                 </Button>
                               )}
                               {onDelete && (
                                 <Button variant="ghost" size="icon" onClick={() => onDelete(row)}>
                                   <Trash className="h-4 w-4" />
                                 </Button>
                               )}
                               {onAssociate && canAssociate(row) && (
                                 <Button variant="ghost" size="icon" onClick={() => onAssociate(row)}>
                                   <Link className="h-4 w-4" />
                                 </Button>
                               )}
                               {onDissociate && canDissociate(row) && (
                                 <Button variant="ghost" size="icon" onClick={() => onDissociate(row)}>
                                   <Unlink className="h-4 w-4" />
                                 </Button>
                               )}
                             </div>
                           )}
                         </TableCell>
                       )}
                    </TableRow>
                    );
                  })
                )
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      {enablePagination && totalPages > 1 && (
        <EnhancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
}
