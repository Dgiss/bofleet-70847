import { useState, useCallback, useRef } from 'react';
import { getLazyClient, withCredentialRetry } from '@/config/aws-config.js';
import { toast } from '@/hooks/use-toast';

const client = getLazyClient();

const SIMPLE_LIST_DEVICES = `
  query ListDevicesSimplified(
    $limit: Int
    $nextToken: String
  ) {
    listDevices(
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        imei
        sim
        protocolId
        deviceVehicleImmat
        vehicle {
          immat
          companyVehiclesId
          company {
            id
            name
          }
        }
      }
      nextToken
    }
  }
`;

const GET_DEVICE = `
  query GetDevice($imei: String!) {
    getDevice(imei: $imei) {
      imei
      protocolId
      sim
      deviceVehicleImmat
      vehicle {
        immat
        companyVehiclesId
        company {
          id
          name
        }
      }
    }
  }
`;

interface Device {
  id: string;
  imei: string;
  sim: string;
  protocolId: string;
  entreprise: string;
  type: string;
  isAssociated: boolean;
  immatriculation?: string;
  companyId?: string;
}

export const useInfiniteDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const nextTokenRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const limitRef = useRef(50);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadMore = useCallback(async (customLimit?: number) => {
    if (isLoadingRef.current || !hasMore) {
      return;
    }

    const limit = customLimit || limitRef.current;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await withCredentialRetry(async () => {
        return await client.graphql({
          query: SIMPLE_LIST_DEVICES,
          variables: {
            limit: limit,
            nextToken: nextTokenRef.current,
          },
        });
      });

      const results = response.data.listDevices.items || [];
      const newNextToken = response.data.listDevices.nextToken;

      console.log(`Loaded ${results.length} devices, nextToken:`, newNextToken ? 'present' : 'none');

      // Map devices to UI format
      const mappedDevices = results.map((device: any) => {
        const isAssociated = !!device.deviceVehicleImmat || !!device.vehicle;
        
        // Extract company name from vehicle.company (most reliable source)
        const companyName = device.vehicle?.company?.name || '';
        const companyId = device.vehicle?.company?.id || device.vehicle?.companyVehiclesId || '';
        
        return {
          id: device.imei,
          imei: device.imei,
          sim: device.sim || '',
          protocolId: device.protocolId?.toString() || '',
          entreprise: companyName || (isAssociated ? 'Entreprise' : 'Boîtier libre'),
          type: 'device',
          isAssociated,
          immatriculation: device.vehicle?.immat || device.deviceVehicleImmat || '',
          companyId: companyId,
          companyName: companyName,
        };
      });

      setDevices(prev => [...prev, ...mappedDevices]);
      nextTokenRef.current = newNextToken;
      setHasMore(!!newNextToken);

      if (!newNextToken) {
        const totalCount = devices.length + mappedDevices.length;
        toast({
          title: "Chargement terminé",
          description: `${totalCount} boîtiers chargés au total`,
        });
      }
    } catch (err: any) {
      console.error('Error loading devices:', err);
      setError(err.message || 'Erreur lors du chargement');
      toast({
        title: "Erreur",
        description: `Erreur: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [hasMore]);

  const reset = useCallback(() => {
    setDevices([]);
    nextTokenRef.current = null;
    setHasMore(true);
    setError(null);
    limitRef.current = 50;
  }, []);

  const loadWithCompanyFilter = useCallback(async (companyId: string) => {
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;
    
    // Reset first
    setDevices([]);
    nextTokenRef.current = null;
    setHasMore(true);
    setError(null);
    limitRef.current = 2000;
    
    isLoadingRef.current = true;
    setLoading(true);

    try {
      let allMatchingDevices: Device[] = [];
      let currentNextToken: string | null = null;
      let totalScanned = 0;
      
      // Loop through all devices using nextToken
      do {
        // Check if aborted
        if (currentAbortController.signal.aborted) {
          console.log('Search cancelled by user');
          return;
        }
        
        const response = await withCredentialRetry(async () => {
          return await client.graphql({
            query: SIMPLE_LIST_DEVICES,
            variables: {
              limit: 1000,
              nextToken: currentNextToken,
            },
          });
        });

        const results = response.data.listDevices.items || [];
        totalScanned += results.length;
        currentNextToken = response.data.listDevices.nextToken;
        
        console.log(`Scanned ${totalScanned} devices total, found ${allMatchingDevices.length} matches so far...`);

        // Map and filter by company
        const batchMatchingDevices = results
          .map((device: any) => {
            const isAssociated = !!device.deviceVehicleImmat || !!device.vehicle;
            const companyName = device.vehicle?.company?.name || '';
            const deviceCompanyId = device.vehicle?.company?.id || device.vehicle?.companyVehiclesId || '';
            
            return {
              id: device.imei,
              imei: device.imei,
              sim: device.sim || '',
              protocolId: device.protocolId?.toString() || '',
              entreprise: companyName || (isAssociated ? 'Entreprise' : 'Boîtier libre'),
              type: 'device',
              isAssociated,
              immatriculation: device.vehicle?.immat || device.deviceVehicleImmat || '',
              companyId: deviceCompanyId,
              companyName: companyName,
            };
          })
          .filter((device: any) => device.companyId === companyId);

        // Add matching devices from this batch
        allMatchingDevices = [...allMatchingDevices, ...batchMatchingDevices];
        
        // Update UI progressively
        setDevices([...allMatchingDevices]);
        
      } while (currentNextToken !== null && !currentAbortController.signal.aborted);

      // Only show success toast if not aborted
      if (!currentAbortController.signal.aborted) {
        setHasMore(false); // No pagination when filtering
        
        toast({
          title: "Recherche terminée",
          description: `${allMatchingDevices.length} boîtier(s) trouvé(s) (${totalScanned} boîtiers scannés au total)`,
        });
      } else {
        // Keep the results found so far, just stop loading
        setHasMore(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || currentAbortController.signal.aborted) {
        console.log('Search was cancelled');
        // Keep existing results, don't reset
        setHasMore(false);
      } else {
        console.error('Error loading devices with company filter:', err);
        setError(err.message || 'Erreur lors du chargement');
        toast({
          title: "Erreur",
          description: `Erreur: ${err.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const searchByImeis = useCallback(async (imeis: string[]) => {
    if (imeis.length === 0) return [];

    setLoading(true);
    setError(null);

    try {
      // Execute all queries in parallel
      const promises = imeis.map(imei => 
        withCredentialRetry(async () => {
          return await client.graphql({
            query: GET_DEVICE,
            variables: { imei: imei.trim() },
          });
        })
      );

      const responses = await Promise.all(promises);
      
      // Map responses to device format
      const foundDevices = responses
        .map(response => response.data.getDevice)
        .filter(device => device !== null)
        .map((device: any) => {
          const isAssociated = !!device.deviceVehicleImmat || !!device.vehicle;
          const companyName = device.vehicle?.company?.name || '';
          const companyId = device.vehicle?.company?.id || device.vehicle?.companyVehiclesId || '';
          
          return {
            id: device.imei,
            imei: device.imei,
            sim: device.sim || '',
            protocolId: device.protocolId?.toString() || '',
            entreprise: companyName || (isAssociated ? 'Entreprise' : 'Boîtier libre'),
            type: 'device',
            isAssociated,
            immatriculation: device.vehicle?.immat || device.deviceVehicleImmat || '',
            companyId: companyId,
            companyName: companyName,
          };
        });

      const notFound = imeis.filter(imei => 
        !foundDevices.some(d => d.imei === imei.trim())
      );

      if (notFound.length > 0) {
        toast({
          title: "IMEIs non trouvés",
          description: `${notFound.length} IMEI(s) non trouvé(s): ${notFound.join(', ')}`,
          variant: "destructive",
        });
      }

      return foundDevices;
    } catch (err: any) {
      console.error('Error searching devices by IMEI:', err);
      setError(err.message || 'Erreur lors de la recherche');
      toast({
        title: "Erreur",
        description: `Erreur: ${err.message}`,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDevice = useCallback((updatedDevice: Device) => {
    setDevices(prevDevices => {
      return prevDevices.map(device => {
        if (device.imei === updatedDevice.imei) {
          return { ...device, ...updatedDevice };
        }
        return device;
      });
    });
  }, []);

  return {
    devices,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    searchByImeis,
    loadWithCompanyFilter,
    cancelSearch,
    updateDevice,
  };
};
