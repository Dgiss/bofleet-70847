import { useState, useEffect, useCallback, useRef } from 'react';
import * as CompanyVehicleDeviceService from '@/services/CompanyVehicleDeviceService';
import * as VehicleService from '@/services/VehicleService.js';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook for managing company-vehicle-device data
 * Provides unified state management and loading states
 */
export const useCompanyVehicleDevice = () => {
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [devices, setDevices] = useState([]);
  const [freeDevices, setFreeDevices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache for all data - single source of truth
  const [allDataCache, setAllDataCache] = useState(null);
  const [isCacheReady, setIsCacheReady] = useState(false);
  const [companiesReady, setCompaniesReady] = useState(false);
  
  // Loading mode states
  const [loadingMode, setLoadingMode] = useState('initial'); // 'initial', 'search', 'complete', 'optimized'
  const [quickStats, setQuickStats] = useState(null);

  // Performance guards
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);

  // AUTO-LOAD companies on mount with debounce + clear cache for fresh data
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialCompanies = async () => {
      if (!isMounted) return;
      
      try {
        console.log('useCompanyVehicleDevice: Auto-loading companies...');
        
        // Clear old cache to force fresh data loading
        localStorage.removeItem('fleetwatch_vehicle_cache');
        console.log('Cleared vehicle cache for fresh data');
        
        const loadedCompanies = await CompanyVehicleDeviceService.fetchCompaniesForSelect();
        
        if (isMounted) {
          console.log('Initial companies loaded:', loadedCompanies.length);
          setCompanies(loadedCompanies);
          setCompaniesReady(true);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error auto-loading companies:', error);
          setCompanies([]);
          setCompaniesReady(false);
        }
      }
    };
    
    // Debounce to prevent multiple simultaneous calls
    const timeoutId = setTimeout(loadInitialCompanies, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // localStorage utilities with better error handling
  const saveToLocalStorage = (data) => {
    try {
      // CRITICAL FIX: Reduce cache size to prevent QuotaExceededError
      const compactData = {
        companies: (data.companies || []).map(c => ({
          id: c.id,
          name: c.name,
          siret: c.siret
        })),
        vehicles: (data.vehicles || []).map(v => ({
          id: v.id,
          immat: v.immat || v.immatriculation,
          type: v.type,
          marque: v.marque,
          modele: v.modele,
          companyVehiclesId: v.companyVehiclesId,
          entreprise: v.entreprise,
          // FIXED: Use actual GraphQL relation - device.imei instead of vehicleDeviceImei
          deviceImei: v.device?.imei || null,
          isAssociated: !!v.device?.imei
        })),
        timestamp: Date.now()
      };
      
      // Check size before saving
      const dataStr = JSON.stringify(compactData);
      const sizeInMB = (dataStr.length * 2) / (1024 * 1024); // Rough estimate
      
      if (sizeInMB > 4) { // Limit to 4MB
        console.warn('Cache data too large, using compact version');
        const ultraCompactData = {
          companies: compactData.companies.slice(0, 50),
          vehicles: compactData.vehicles.slice(0, 200),
          timestamp: Date.now()
        };
        localStorage.setItem('fleetwatch_vehicle_cache', JSON.stringify(ultraCompactData));
      } else {
        localStorage.setItem('fleetwatch_vehicle_cache', dataStr);
      }
      
      console.log('Data saved to localStorage (size:', sizeInMB.toFixed(2), 'MB)');
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded, clearing cache');
        localStorage.removeItem('fleetwatch_vehicle_cache');
        // Try saving minimal data only
        try {
          const minimalData = {
            companies: (data.companies || []).slice(0, 10).map(c => ({ id: c.id, name: c.name })),
            vehicles: (data.vehicles || []).slice(0, 50).map(v => ({ 
              immat: v.immat || v.immatriculation, 
              type: v.type,
              deviceImei: v.device?.imei || null
            })),
            timestamp: Date.now()
          };
          localStorage.setItem('fleetwatch_vehicle_cache', JSON.stringify(minimalData));
          console.log('Saved minimal cache after quota error');
        } catch (fallbackError) {
          console.error('Failed to save even minimal cache:', fallbackError);
        }
      } else {
        console.error('Error saving to localStorage:', error);
      }
    }
  };
  
  const loadFromLocalStorage = () => {
    try {
      const cached = localStorage.getItem('fleetwatch_vehicle_cache');
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now - data.timestamp > thirtyMinutes) {
        console.log('Cache expired, removing from localStorage');
        localStorage.removeItem('fleetwatch_vehicle_cache');
        return null;
      }
      
      console.log('Valid cache found in localStorage');
      return data;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      localStorage.removeItem('fleetwatch_vehicle_cache');
      return null;
    }
  };
  
  const refreshDataInBackground = async () => {
    try {
      console.log('Refreshing data in background...');
      const result = await VehicleService.fetchCompaniesWithVehicles();
      
      // Update cache
      setAllDataCache(result);
      saveToLocalStorage(result);
      
      // Update state silently
      setCompanies(result.companies || []);
      setDevices(result.vehicles || []);
      
      console.log('Background refresh completed');
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  };

  // Load all data - OPTIMIZED for performance
  const loadAllData = useCallback(async (mode = 'optimized') => {
    setLoadingMode(mode);
    setLoading(true);
    setError(null);
    
    try {
      console.log(`=== LOADING ALL DATA (${mode.toUpperCase()}) - OPTIMIZED ===`);
      
      const startTime = Date.now();
      let result;
      
      if (mode === 'complete') {
        // Complete dataset including free devices
        console.log('Using complete query including free devices...');
        result = await VehicleService.fetchCompaniesWithVehicles();
      } else {
        // Optimized: vehicles fast + free devices merged
        console.log('Using optimized vehicles + free devices merge...');
        
        // Use Promise.allSettled to prevent total failure if one part fails
        const results = await Promise.allSettled([
          VehicleService.fetchAllVehiclesOptimized(),
          CompanyVehicleDeviceService.fetchDevicesWithoutVehicles()
        ]);
        
        // Extract successful results and handle failures gracefully
        const baseResult = results[0].status === 'fulfilled' 
          ? results[0].value 
          : { companies: [], vehicles: [] };
          
        const freeDevicesResult = results[1].status === 'fulfilled' 
          ? results[1].value 
          : [];
        
        // Log any failures for debugging
        if (results[0].status === 'rejected') {
          console.error('Failed to load vehicles:', results[0].reason);
        }
        if (results[1].status === 'rejected') {
          console.warn('Failed to load free devices (partial data mode):', results[1].reason);
        }
        
        result = {
          companies: baseResult.companies || [],
          vehicles: [...(baseResult.vehicles || []), ...(freeDevicesResult || [])]
        };
        
        // Show warning if devices failed to load
        if (results[1].status === 'rejected') {
          console.warn('Note: Free devices could not be loaded, showing vehicles only');
        }
      }
      
      const loadTime = Date.now() - startTime;
      console.log(`=== DATA LOADED SUCCESSFULLY IN ${loadTime}ms ===`);
      console.log('Companies count:', result.companies?.length || 0);
      console.log('Combined data count:', result.vehicles?.length || 0);
      
      // Update state efficiently
      setCompanies(result.companies || []);
      setDevices(result.vehicles || []);
      
      // Cache for client-side filtering
      setAllDataCache(result);
      setIsCacheReady(true);
      
      // Save to localStorage in background
      setTimeout(() => saveToLocalStorage(result), 0);
      
      // Calculate stats efficiently
      const vehicles = result.vehicles || [];
      const vehicleCount = vehicles.filter(item => item.type === "vehicle").length;
      const associatedDeviceCount = vehicles.filter(item => 
        item.type === "device" && item.isAssociated
      ).length;
      const freeDevicesCount = vehicles.filter(item => 
        item.type === "device" && !item.isAssociated
      ).length;
      
      setFreeDevices(freeDevicesCount);
      setStats({
        vehicleCount,
        associatedDeviceCount,
        freeDeviceCount: freeDevicesCount
      });
      
      toast({
        title: "Données chargées",
        description: `${vehicleCount} véhicules, ${freeDevicesCount} boîtiers libres (${loadTime}ms)`,
      });
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'An error occurred');
      // Reset states on error
      setCompanies([]);
      setDevices([]);
      setAllDataCache(null);
      setIsCacheReady(false);
      setFreeDevices(0);
      setStats({});
      
      toast({
        title: "Erreur",
        description: `Erreur lors du chargement: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Search with filters - CLIENT-SIDE using cached data (OPTIMIZED)
  const searchDevices = useCallback(async (filters) => {
    if (!allDataCache || !isCacheReady) {
      console.log('Cache not ready for search, loading data...');
      await loadAllData();
      if (!allDataCache) return [];
    }
    
    try {
      // FIXED: Use vehicles array instead of devices for client-side filtering
      const results = CompanyVehicleDeviceService.filterDevicesLocal(allDataCache.vehicles, filters);
      
      console.log(`Search results for filters ${JSON.stringify(filters)}:`, results.length);
      
      return results;
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
      return [];
    }
  }, [allDataCache, isCacheReady, loadAllData]);

  // Get vehicles for specific company - SIMPLIFIED logic
  const getVehiclesByCompany = useCallback(async (companyId) => {
    if (!isCacheReady || !allDataCache) {
      console.log('Cache not ready for getVehiclesByCompany, cache ready:', isCacheReady);
      return [];
    }
    
    try {
      // Client-side filtering using cached data
      const companyVehicles = CompanyVehicleDeviceService.filterVehiclesByCompanyLocal(
        allDataCache.vehicles, 
        companyId, 
        allDataCache.companies
      );
      
      console.log('Raw company vehicles found:', companyVehicles.length);
      
      // FIXED: Filter for vehicles WITHOUT an associated device using GraphQL relations
      const availableVehicles = companyVehicles.filter(vehicle => {
        // Check device relation - use actual GraphQL schema
        const hasDevice = vehicle.device?.imei || vehicle.deviceImei;
        
        console.log(`Vehicle ${vehicle.immat || vehicle.immatriculation}: hasDevice=${!!hasDevice}, available=${!hasDevice}`);
        
        return !hasDevice; // Available if no device associated
      });
      
      console.log('Available vehicles for association:', availableVehicles.length);
      
      return availableVehicles;
    } catch (err) {
      console.error('Error getting vehicles by company:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: `Erreur lors de la récupération des véhicules: ${err.message}`,
        variant: "destructive",
      });
      return [];
    }
  }, [allDataCache, isCacheReady]);

  // Get ALL vehicles for specific company (including those with IMEI) - fallback function
  const getAllVehiclesByCompany = useCallback(async (companyId) => {
    if (!isCacheReady || !allDataCache) {
      console.log('Cache not ready for getAllVehiclesByCompany, cache ready:', isCacheReady);
      return [];
    }
    
    try {
      // Client-side filtering using cached data - returns ALL vehicles
      const companyVehicles = CompanyVehicleDeviceService.filterVehiclesByCompanyLocal(
        allDataCache.vehicles, 
        companyId, 
        allDataCache.companies
      );
      
      console.log('ALL company vehicles (including those with IMEI):', companyVehicles);
      
      // FIXED: Add status indicator using actual GraphQL relations
      const vehiclesWithStatus = companyVehicles.map(vehicle => {
        const deviceImei = vehicle.device?.imei || vehicle.deviceImei;
        const isAssociated = !!deviceImei;
        
        return {
          ...vehicle,
          isAssociated,
          associatedDevice: deviceImei
        };
      });
      
      return vehiclesWithStatus;
    } catch (err) {
      console.error('Error getting all vehicles by company:', err);
      setError(err.message);
      return [];
    }
  }, [allDataCache, isCacheReady]);

  // Get device status - CLIENT-SIDE using cached data
  const getDeviceStatus = useCallback(async (imei) => {
    if (!allDataCache) {
      await loadAllData();
      return { found: false, message: 'No data available' };
    }
    
    try {
      return CompanyVehicleDeviceService.getDeviceStatusLocal(allDataCache.vehicles, imei);
    } catch (err) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la vérification du device: ${err.message}`,
        variant: "destructive",
      });
      return { found: false, message: err.message };
    }
  }, [allDataCache, loadAllData]);

  // Load companies for select components - ALWAYS load companies
  const loadCompaniesForSelect = useCallback(async () => {
    try {
      // Try cached companies first
      if (allDataCache && allDataCache.companies && allDataCache.companies.length > 0) {
        console.log('Using cached companies:', allDataCache.companies.length);
        setCompanies(allDataCache.companies);
        return allDataCache.companies;
      }
      
      // If no cache, load directly from API
      console.log('No cached companies, fetching from API');
      const loadedCompanies = await CompanyVehicleDeviceService.fetchCompaniesForSelect();
      console.log('Companies loaded:', loadedCompanies.length);
      setCompanies(loadedCompanies);
      return loadedCompanies;
    } catch (err) {
      console.error('Error in loadCompaniesForSelect:', err);
      setCompanies([]);
      toast({
        title: "Erreur",
        description: `Erreur lors du chargement des entreprises: ${err.message}`,
        variant: "destructive",
      });
      return [];
    }
  }, [allDataCache]);

  // Specific search functions for single criteria - CLIENT-SIDE using cached data
  const searchByImei = useCallback(async (imei) => {
    if (!allDataCache) {
      await loadAllData();
      return [];
    }
    
    try {
      // Normalize/sanitize IMEI input: accept separators and pick the first 15-digit token
      const raw = typeof imei === 'string' ? imei : String(imei);
      const tokens = raw
        .split(/[^0-9A-Za-z]+/)
        .map(t => t.trim())
        .filter(Boolean);
      // Prefer a 15-digit numeric token if present, else the first token
      const preferred = tokens.find(t => /^\d{15}$/.test(t)) || tokens[0] || raw.trim();
      const sanitizedImei = preferred;

      console.log(`🔍 ENHANCED IMEI SEARCH - Input: "${imei}" -> Sanitized: "${sanitizedImei}"`);
      console.log(`🔍 Cache state - Total items: ${allDataCache.vehicles?.length || 0}`);
      
      // DIAGNOSTIC: Special handling for problematic IMEI
      if (sanitizedImei === '350612071728933') {
        console.log('🎯 PROBLEMATIC IMEI DETECTED - Running enhanced diagnostic');
        try {
          const { ImeiDiagnosticService } = await import('../services/ImeiDiagnosticService.js');
          const diagnosticResults = await ImeiDiagnosticService.runFullDiagnostic(sanitizedImei);
          
          // If found in diagnostic, use that data
          const successfulTest = diagnosticResults.tests.find(test => test.success && test.data);
          if (successfulTest) {
            console.log('✅ DIAGNOSTIC SUCCESS - Found via:', successfulTest.name);
            const device = successfulTest.data;
            const mapped = {
              id: device.imei,
              entreprise: device.vehicle?.company?.name || (device.isAssociated ? "Associé" : "Boîtier libre"),
              type: "device",
              immatriculation: device.vehicle?.immat || device.deviceVehicleImmat || "",
              nomVehicule: device.vehicle?.nomVehicule || "",
              imei: device.imei,
              typeBoitier: device.protocolId?.toString() || "",
              marque: "",
              modele: "",
              kilometrage: "",
              telephone: device.sim || "",
              emplacement: "",
              deviceData: device,
              isAssociated: !!device.vehicle?.immat || !!device.deviceVehicleImmat
            };
            
            toast({
              title: "Recherche par IMEI (Diagnostic)",
              description: `IMEI trouvé via diagnostic: ${successfulTest.name}`,
            });
            return [mapped];
          }
        } catch (diagnosticError) {
          console.error('❌ Diagnostic failed:', diagnosticError);
        }
      }
      
      // Debug: Check cache timestamp and age
      const now = Date.now();
      const lastCacheUpdate = localStorage.getItem('companyVehicleDeviceData_timestamp');
      const cacheAge = lastCacheUpdate ? now - parseInt(lastCacheUpdate) : Infinity;
      console.log(`🔍 Cache age: ${Math.round(cacheAge / 1000)}s (${Math.round(cacheAge / 60000)}min)`);

      // Debug: Show some cache content
      if (allDataCache.vehicles) {
        const deviceCount = allDataCache.vehicles.filter(v => v.type === 'device').length;
        const vehicleCount = allDataCache.vehicles.filter(v => v.type === 'vehicle').length;
        console.log(`🔍 Cache breakdown - Devices: ${deviceCount}, Vehicles: ${vehicleCount}`);
        
        // Show first few devices for debugging
        const devices = allDataCache.vehicles.filter(v => v.type === 'device').slice(0, 3);
        console.log(`🔍 Sample devices in cache:`, devices.map(d => ({ imei: d.imei, associated: d.isAssociated })));
      }

      // First, search locally in the unified cache
      const localResults = CompanyVehicleDeviceService.filterByImeiLocal(allDataCache.vehicles, sanitizedImei);
      console.log(`🔍 Local search results:`, localResults.length > 0 ? localResults : 'NONE FOUND');
      
      if (localResults.length > 0) {
        toast({
          title: "Recherche par IMEI",
          description: `${localResults.length} résultat(s) trouvé(s) (cache)`
        });
        return localResults;
      }

      // ENHANCED: Force cache refresh if no results and cache is stale OR if specifically requested
      console.log('🔍 No local results found');
      
      // Always try refresh if cache is older than 2 minutes OR if no results found
      const shouldRefresh = cacheAge > 120000 || localResults.length === 0;
      
      if (shouldRefresh) {
        console.log('🔍 Forcing cache refresh - cache age or no results...');
        await loadAllData();
        
        // Retry local search after refresh
        const refreshedResults = CompanyVehicleDeviceService.filterByImeiLocal(allDataCache.vehicles, sanitizedImei);
        console.log(`🔍 Post-refresh local search results:`, refreshedResults.length > 0 ? refreshedResults : 'STILL NONE');
        
        if (refreshedResults.length > 0) {
          toast({
            title: "Recherche par IMEI",
            description: `${refreshedResults.length} résultat(s) trouvé(s) (cache rafraîchi)`
          });
          return refreshedResults;
        }
      }

      // ENHANCED: Use the new diagnostic service for backend fallback
      console.log('🔍 Trying enhanced backend search...');
      
      try {
        const { ImeiDiagnosticService } = await import('../services/ImeiDiagnosticService.js');
        const foundDevice = await ImeiDiagnosticService.enhancedImeiSearch(sanitizedImei);
        
        if (foundDevice) {
          console.log('✅ Found via enhanced search:', foundDevice);
          const mapped = {
            id: foundDevice.imei,
            entreprise: foundDevice.vehicle?.company?.name || (foundDevice.isAssociated ? "Associé" : "Boîtier libre"),
            type: "device",
            immatriculation: foundDevice.vehicle?.immat || foundDevice.deviceVehicleImmat || "",
            nomVehicule: foundDevice.vehicle?.nomVehicule || "",
            imei: foundDevice.imei,
            typeBoitier: foundDevice.protocolId?.toString() || "",
            marque: "",
            modele: "",
            kilometrage: "",
            telephone: foundDevice.sim || "",
            emplacement: "",
            deviceData: foundDevice,
            isAssociated: !!foundDevice.vehicle?.immat || !!foundDevice.deviceVehicleImmat
          };
          
          toast({
            title: "Recherche par IMEI",
            description: `1 résultat trouvé via recherche améliorée`,
          });
          return [mapped];
        }
        
      } catch (enhancedError) {
        console.error('🔍 Enhanced search failed:', enhancedError);
        
        // FALLBACK: Try original backend strategies
        console.log('🔍 Falling back to original backend strategies...');
        
        try {
          const { getGraphQLClient } = await import('@/config/aws-config.js');
          const { getDevice, listDevices } = await import('../graphql/queries');
          const client = await getGraphQLClient();
          
          // Strategy 1: Direct getDevice lookup
          console.log('🔍 Fallback Strategy 1: Direct getDevice lookup');
          const response = await client.graphql({
            query: getDevice,
            variables: { imei: sanitizedImei }
          });
          const device = response.data?.getDevice;
          
          if (device) {
            console.log('🔍 Device found via getDevice fallback:', device);
            const mapped = {
              id: device.imei,
              entreprise: device.vehicle?.company?.name || (device.vehicle ? "Associé" : "Boîtier libre"),
              type: "device",
              immatriculation: device.vehicle?.immat || device.deviceVehicleImmat || "",
              nomVehicule: device.vehicle?.nomVehicule || "",
              imei: device.imei,
              typeBoitier: device.protocolId?.toString() || "",
              marque: "",
              modele: "",
              kilometrage: "",
              telephone: device.sim || "",
              emplacement: "",
              deviceData: device,
              isAssociated: !!device.vehicle?.immat || !!device.deviceVehicleImmat
            };
            toast({ title: "Recherche par IMEI", description: `1 résultat trouvé (fallback direct)` });
            return [mapped];
          }

          // Strategy 2: List devices with enhanced filter using new GraphQL structure
          console.log('🔍 Fallback Strategy 2: Enhanced ListDevices');
          
          // Try with imei parameter first (new structure)
          try {
            const listResponse = await client.graphql({
              query: listDevices,
              variables: { 
                imei: sanitizedImei,
                limit: 20 
              }
            });
            const devices = listResponse.data?.listDevices?.items || [];
            
            if (devices.length > 0) {
              console.log('🔍 Devices found via listDevices (imei param):', devices);
              const mappedDevices = devices.map(device => ({
                id: device.imei,
                entreprise: device.vehicle?.company?.name || (device.vehicle ? "Associé" : "Boîtier libre"),
                type: "device",
                immatriculation: device.vehicle?.immat || device.deviceVehicleImmat || "",
                nomVehicule: device.vehicle?.nomVehicule || "",
                imei: device.imei,
                typeBoitier: device.protocolId?.toString() || "",
                marque: "",
                modele: "",
                kilometrage: "",
                telephone: device.sim || "",
                emplacement: "",
                deviceData: device,
                isAssociated: !!device.vehicle?.immat || !!device.deviceVehicleImmat
              }));
              toast({ title: "Recherche par IMEI", description: `${mappedDevices.length} résultat(s) trouvé(s) (fallback param)` });
              return mappedDevices;
            }
          } catch (paramError) {
            console.warn('🔍 IMEI parameter failed, trying filter:', paramError);
          }
          
          // Try with filter as fallback
          try {
            const listResponse = await client.graphql({
              query: listDevices,
              variables: { 
                filter: { imei: { eq: sanitizedImei } },
                limit: 20 
              }
            });
            const devices = listResponse.data?.listDevices?.items || [];
            
            if (devices.length > 0) {
              console.log('🔍 Devices found via listDevices (filter):', devices);
              const mappedDevices = devices.map(device => ({
                id: device.imei,
                entreprise: device.vehicle?.company?.name || (device.vehicle ? "Associé" : "Boîtier libre"),
                type: "device",
                immatriculation: device.vehicle?.immat || device.deviceVehicleImmat || "",
                nomVehicule: device.vehicle?.nomVehicule || "",
                imei: device.imei,
                typeBoitier: device.protocolId?.toString() || "",
                marque: "",
                modele: "",
                kilometrage: "",
                telephone: device.sim || "",
                emplacement: "",
                deviceData: device,
                isAssociated: !!device.vehicle?.immat || !!device.deviceVehicleImmat
              }));
              toast({ title: "Recherche par IMEI", description: `${mappedDevices.length} résultat(s) trouvé(s) (fallback filter)` });
              return mappedDevices;
            }
          } catch (filterError) {
            console.warn('🔍 Filter also failed:', filterError);
          }
          
        } catch (fallbackError) {
          console.error('🔍 All fallback strategies failed:', fallbackError);
        }
      }

      console.log('🔍 IMEI not found in any strategy');
      toast({ title: "Recherche par IMEI", description: `IMEI ${sanitizedImei} introuvable` });
      return [];
      
    } catch (err) {
      console.error('🔍 IMEI search error:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: `Erreur lors de la recherche par IMEI: ${err.message}`,
        variant: "destructive"
      });
      return [];
    }
  }, [allDataCache, loadAllData]);

  const searchBySim = useCallback(async (sim) => {
    if (!allDataCache) {
      await loadAllData();
      return [];
    }
    
    try {
      const results = CompanyVehicleDeviceService.filterBySimLocal(allDataCache.vehicles, sim);
      
      toast({
        title: "Recherche par SIM",
        description: `${results.length} résultat(s) trouvé(s)`,
      });
      
      return results;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: `Erreur lors de la recherche par SIM: ${err.message}`,
        variant: "destructive",
      });
      return [];
    }
  }, [allDataCache, loadAllData]);

  const searchByVehicle = useCallback(async (vehicle) => {
    if (!allDataCache) {
      await loadAllData();
      return [];
    }
    
    try {
      // Use the existing filterByVehicleLocal function which already handles the unified format
      const results = CompanyVehicleDeviceService.filterByVehicleLocal(allDataCache.vehicles, vehicle);
      
      toast({
        title: "Recherche par véhicule",
        description: `${results.length} résultat(s) trouvé(s)`,
      });
      
      return results;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: `Erreur lors de la recherche par véhicule: ${err.message}`,
        variant: "destructive",
      });
      return [];
    }
  }, [allDataCache, loadAllData]);

  const searchByCompany = useCallback(async (company) => {
    if (!allDataCache) {
      await loadAllData();
      return [];
    }
    
    try {
      const results = CompanyVehicleDeviceService.filterByCompanyLocal(
        allDataCache.vehicles, 
        company, 
        allDataCache.companies
      );
      
      if (results.length === 0) {
        toast({
          title: "Aucun résultat",
          description: `Aucune entreprise trouvée pour "${company}". Vérifiez l'orthographe.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recherche par entreprise",
          description: `${results.length} résultat(s) trouvé(s) pour "${company}"`,
        });
      }
      
      return results;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: `Erreur lors de la recherche par entreprise: ${err.message}`,
        variant: "destructive",
      });
      return [];
    }
  }, [allDataCache, loadAllData]);

  // OPTIMIZED: Get vehicles without devices (no cache needed)
  const getVehiclesWithoutDevices = useCallback(async () => {
    try {
      const vehicles = await CompanyVehicleDeviceService.fetchVehiclesWithoutDevices();
      
      toast({
        title: "Véhicules sans IMEI",
        description: `${vehicles.length} véhicule(s) sans boîtier trouvé(s)`,
      });
      
      return vehicles;
    } catch (err) {
      console.error('Error getting vehicles without devices:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: `Erreur lors de la récupération des véhicules sans IMEI: ${err.message}`,
        variant: "destructive",
      });
      return [];
    }
  }, []);

  // OPTIMIZED: Get vehicles with empty IMEI with progressive loading
  const getVehiclesWithEmptyImei = useCallback(async (onProgressUpdate = null) => {
    try {
      console.log('=== HOOK: GETTING VEHICLES WITH EMPTY IMEI ===');
      const vehicles = await CompanyVehicleDeviceService.fetchVehiclesWithEmptyImei(onProgressUpdate);
      
      console.log('Hook: Vehicles with empty IMEI received:', vehicles.length);
      
      toast({
        title: "Véhicules sans IMEI",
        description: `${vehicles.length} véhicule(s) sans IMEI assigné trouvé(s)`,
      });
      
      return vehicles;
    } catch (err) {
      console.error('=== HOOK ERROR: Getting vehicles with empty IMEI ===');
      console.error('Hook error details:', err);
      console.error('Hook error message:', err.message);
      
      // Provide more specific error handling
      let errorMessage = 'Erreur lors de la récupération des véhicules sans IMEI';
      if (err.message && err.message !== 'undefined') {
        errorMessage += `: ${err.message}`;
      } else {
        errorMessage += ': Erreur inconnue, vérifiez la console pour plus de détails';
      }
      
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  }, []);

  // OPTIMIZED: Get devices without vehicles (no cache needed)
  const getDevicesWithoutVehicles = useCallback(async () => {
    try {
      const devices = await CompanyVehicleDeviceService.fetchDevicesWithoutVehicles();
      
      toast({
        title: "Devices sans véhicules",
        description: `${devices.length} boîtier(s) libre(s) trouvé(s)`,
      });
      
      return devices;
    } catch (err) {
      console.error('Error getting devices without vehicles:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: `Erreur lors de la récupération des boîtiers libres: ${err.message}`,
        variant: "destructive",
      });
      return [];
    }
  }, []);

  // OPTIMIZED: Get stats for unassociated items
  const getUnassociatedItemsStats = useCallback(async () => {
    try {
      return await CompanyVehicleDeviceService.fetchUnassociatedItemsStats();
    } catch (err) {
      console.error('Error getting unassociated items stats:', err);
      setError(err.message);
      return {
        vehiclesWithoutDevicesCount: 0,
        devicesWithoutVehiclesCount: 0,
        totalVehicles: 0,
        totalDevices: 0
      };
    }
  }, []);

  // FIXED: Load basic statistics with proper error handling and fallback
  const loadQuickStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use cached data as primary source for quick stats
      const cachedData = loadFromLocalStorage();
      if (cachedData && cachedData.companies && cachedData.vehicles) {
        const vehicleCount = (cachedData.vehicles || []).filter(item => item.type === "vehicle").length;
        const deviceCount = (cachedData.vehicles || []).filter(item => item.type === "device").length;
        
        setQuickStats({
          totalVehicles: vehicleCount,
          totalDevices: deviceCount
        });
        console.log('Quick stats loaded from cache:', { totalVehicles: vehicleCount, totalDevices: deviceCount });
        return;
      }
      
      // Fallback to simplified GraphQL queries with better error handling
      try {
        const { getGraphQLClient } = await import('@/config/aws-config.js');
        const { listCompanies } = await import('../graphql/queries');
        const client = await getGraphQLClient();
        
        // Simple count query that should work with the schema
        const companiesResult = await client.graphql({
          query: listCompanies,
          variables: { limit: 1 }
        });
        
        // Set basic stats
        setQuickStats({
          totalVehicles: 0, // Will be updated when data loads
          totalDevices: 0,  // Will be updated when data loads
          totalCompanies: companiesResult.data?.listCompanies?.items?.length || 0
        });
        
        console.log('Basic quick stats loaded');
      } catch (graphqlError) {
        console.warn('GraphQL quick stats failed, using minimal fallback:', graphqlError);
        // Use absolute minimal stats
        setQuickStats({
          totalVehicles: companies.length > 0 ? 0 : 0,
          totalDevices: companies.length > 0 ? 0 : 0
        });
      }
    } catch (error) {
      console.error('Error loading quick stats:', error);
      // Always provide some stats, even if empty
      setQuickStats({
        totalVehicles: 0,
        totalDevices: 0
      });
    } finally {
      setLoading(false);
    }
  }, [companies.length]);

  // MODIFIED: Initialize only cached data and quick stats on mount
  useEffect(() => {
    console.log('=== INITIALIZING ON-DEMAND LOADING MODE ===');
    const cachedData = loadFromLocalStorage();
    
    if (cachedData) {
      console.log('Found cached data - setting as available but not loading to state');
      setAllDataCache(cachedData);
      setIsCacheReady(true);
      // Don't load to state automatically anymore
    }
    
    // Load quick stats for dashboard
    loadQuickStats();
  }, [loadQuickStats]); // Include loadQuickStats in dependencies

  // Reset to show all data
  const resetFilters = useCallback(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // Data
    companies,
    vehicles,
    devices,
    freeDevices,
    stats,
    
    // State
    loading,
    error,
    isCacheReady,
    loadingMode,
    quickStats,
    
    // Cache status
    allDataCache,
    
    // Actions
    loadAllData,
    loadQuickStats,
    setLoadingMode,
    searchDevices,
    searchByImei,
    searchBySim,
    searchByVehicle,
    searchByCompany,
    getVehiclesByCompany,
    getAllVehiclesByCompany,
    getDeviceStatus,
    loadCompaniesForSelect,
    resetFilters,
    
    // OPTIMIZED: New specialized functions for unassociated items
    getVehiclesWithoutDevices,
    getVehiclesWithEmptyImei,
    getDevicesWithoutVehicles,
    getUnassociatedItemsStats,
    
    // Utilities
    isFiltered: devices.length !== stats.totalDevices,
    totalResults: devices.length
  };
};

export default useCompanyVehicleDevice;
