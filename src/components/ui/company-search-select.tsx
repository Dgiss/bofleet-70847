
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchCompaniesReal } from "@/services/CompanyVehicleDeviceService";

interface CompanySearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchFunction?: (searchTerm: string) => Promise<any[]>;
}

// Debounce hook to prevent excessive API calls
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function CompanySearchSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner une entreprise",
  className,
  disabled = false,
  searchFunction = searchCompaniesReal
}: CompanySearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companiesCache, setCompaniesCache] = useState<Map<string, any[]>>(new Map());
  
  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized search function with caching
  const searchCompanies = useCallback(async (term: string) => {
    // Check cache first
    if (companiesCache.has(term)) {
      return companiesCache.get(term) || [];
    }
    
    setLoading(true);
    try {
      const results = await searchFunction(term);
      
      // Cache the results
      setCompaniesCache(prev => new Map(prev.set(term, results)));
      
      return results;
    } catch (error) {
      console.error("Error searching companies:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [searchFunction]);

  // Search companies when debounced search term changes
  useEffect(() => {
    let isMounted = true;
    
    const performSearch = async () => {
      if (!isMounted) return;
      
      const results = await searchCompanies(debouncedSearchTerm);
      
      if (isMounted) {
        setCompanies(results);
      }
    };
    
    performSearch();
    
    return () => {
      isMounted = false;
    };
  }, [debouncedSearchTerm, searchCompanies]);

  // Load initial companies when opened
  useEffect(() => {
    if (open && companies.length === 0) {
      // Force initial search
      const performInitialSearch = async () => {
        const results = await searchCompanies("");
        setCompanies(results);
      };
      performInitialSearch();
    }
  }, [open, searchCompanies]);

  // Ensure selected company label is available when value is prefilled
  useEffect(() => {
    if (!value) return;
    const exists = companies.some(c => c.id === value || c.name === value);
    if (exists) return;
    (async () => {
      try {
        const results = await searchCompanies(String(value));
        if (!Array.isArray(results) || results.length === 0) return;
        setCompanies(prev => {
          const merged = [...prev];
          for (const r of results) {
            if (!merged.some(c => c.id === r.id)) merged.push(r);
          }
          return merged;
        });
      } catch (e) {
        console.error('Error preloading selected company:', e);
      }
    })();
  }, [value, companies, searchCompanies]);

  const selectedCompany = useMemo(() => 
    companies.find(company => company.id === value || company.name === value),
    [companies, value]
  );

  const handleSelect = (company: any) => {
    onValueChange(company.id || company.name);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          {selectedCompany ? selectedCompany.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Rechercher une entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm">
                Recherche en cours...
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {searchTerm ? 
                    `Aucune entreprise trouvée pour "${searchTerm}"` : 
                    "Aucune entreprise trouvée"
                  }
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.name}
                      onSelect={() => handleSelect(company)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === company.id || value === company.name 
                            ? "opacity-100" 
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{company.name}</span>
                        {company.siret && (
                          <span className="text-xs text-muted-foreground">
                            SIRET: {company.siret}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
