
import React from "react";
import { Input } from "@/components/ui/input";
import { Filter, Calendar, Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SimCardFiltersProps {
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  periodFilter: string;
  setPeriodFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function SimCardFilters({
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  periodFilter,
  setPeriodFilter,
  searchTerm,
  setSearchTerm
}: SimCardFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="relative w-full sm:w-auto">
        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="pl-8 w-full sm:w-44">
            <SelectValue placeholder="Type de SIM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="Truphone">Truphone</SelectItem>
            <SelectItem value="Things Mobile">Things Mobile</SelectItem>
            <SelectItem value="Phenix">Phenix</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative w-full sm:w-auto">
        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="pl-8 w-full sm:w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="suspended">Suspendu</SelectItem>
            <SelectItem value="blocked">Bloqué</SelectItem>
            <SelectItem value="recharging">En recharge</SelectItem>
            <SelectItem value="expired">Crédits épuisés</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative w-full sm:w-auto">
        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="pl-8 w-full sm:w-44">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Jour</SelectItem>
            <SelectItem value="week">Semaine</SelectItem>
            <SelectItem value="month">Mois</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher par ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
