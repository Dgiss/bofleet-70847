import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { withCredentialRetry, waitForAmplifyConfig, ensureCredentials, getLazyClient } from '@/config/aws-config.js';

const client = getLazyClient();

/**
 * Fetch companies for select components
 */
export const fetchCompaniesForSelect = async () => {
  return await withCredentialRetry(async () => {
    try {
      // In-memory cache (60s) to avoid repeated queries
      if (fetchCompaniesForSelect._cache && Date.now() - fetchCompaniesForSelect._cache.ts < 60000) {
        return fetchCompaniesForSelect._cache.data;
      }

      const response = await client.graphql({
        query: `query ListCompanyNames($limit: Int) {\n          listCompanies(limit: $limit) {\n            items { id name siret }\n            nextToken\n          }\n        }`,
        variables: { limit: 1000 }
      });
      
      const companies = response.data.listCompanies.items.map(company => ({
        id: company.id,
        name: company.name,
        siret: company.siret
      }));
      
      // Save cache
      fetchCompaniesForSelect._cache = { data: companies, ts: Date.now() };
      return companies;
    } catch (error) {
      console.error('Error fetching companies for select:', error);
      throw error;
    }
  });
};

/**
 * Search companies with a real-time backend query - Case insensitive search
 */
export const searchCompaniesReal = async (searchTerm) => {
  return await withCredentialRetry(async () => {
    try {
      // If the term looks like an ID, try direct lookup first
      const looksLikeId = typeof searchTerm === 'string' && searchTerm.trim() !== '' && /[a-zA-Z0-9-]{8,}/.test(searchTerm);
      if (looksLikeId) {
        try {
          const res = await client.graphql({
            query: queries.getCompany,
            variables: { id: searchTerm.trim() }
          });
          const company = res?.data?.getCompany;
          if (company?.id) {
            const found = [{ id: company.id, name: company.name, siret: company.siret }];
            console.log(`Recherche par ID "${searchTerm}": 1 entreprise trouvée`);
            return found;
          }
        } catch (e) {
          // ignore and fall back to name search
        }
      }

      // Si pas de terme de recherche, retourner les premières entreprises
      if (!searchTerm || searchTerm.trim() === '') {
        const response = await client.graphql({
          query: queries.listCompanies,
          variables: { limit: 20 }
        });
        
        return response.data.listCompanies.items.map(company => ({
          id: company.id,
          name: company.name,
          siret: company.siret
        }));
      }
      
      // Recherche d'abord avec le terme exact
      let response = await client.graphql({
        query: queries.listCompanies,
        variables: {
          filter: {
            name: { contains: searchTerm }
          },
          limit: 50
        }
      });

      let companies = response.data.listCompanies.items;

      // Si aucun résultat avec le terme exact, essayer une recherche plus large
      if (companies.length === 0) {
        const searchVariations = [
          searchTerm.toLowerCase(),
          searchTerm.toUpperCase(),
          searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase()
        ];

        for (const variation of searchVariations) {
          if (companies.length > 0) break;
          
          response = await client.graphql({
            query: queries.listCompanies,
            variables: {
              filter: {
                name: { contains: variation }
              },
              limit: 50
            }
          });
          
          companies = response.data.listCompanies.items;
        }
      }

      // Si toujours aucun résultat, chercher dans toutes les entreprises
      if (companies.length === 0) {
        response = await client.graphql({
          query: queries.listCompanies,
          variables: { limit: 1000 }
        });
        
        const allCompanies = response.data.listCompanies.items;
        console.log(`📊 Total d'entreprises dans la base: ${allCompanies.length}`);
        
        // Filtrer manuellement avec une recherche plus flexible
        const searchLower = searchTerm.toLowerCase();
        companies = allCompanies.filter(company => 
          company.name && (
            company.name.toLowerCase().includes(searchLower) ||
            (company.siret && company.siret.includes(searchTerm))
          )
        );
        
        console.log(`📋 Recherche manuelle: ${companies.length} entreprises trouvées`);
        
        // Log des premières entreprises pour debug
        if (allCompanies.length > 0) {
          console.log(`🏢 Exemples d'entreprises en base:`, 
            allCompanies.slice(0, 5).map(c => c.name)
          );
        }
      }
      
      const finalCompanies = companies.map(company => ({
        id: company.id,
        name: company.name,
        siret: company.siret
      }));
      
      console.log(`Recherche "${searchTerm}": ${finalCompanies.length} entreprises trouvées`);
      return finalCompanies;
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  });
};

/**
 * Filter devices locally (client-side)
 */
export const filterDevicesLocal = (devices, filters) => {
  const { imei, immatriculation, entreprise } = filters;
  
  // Parse IMEI inputs: support separators and concatenated 15-digit chunks
  const parseImeis = (input) => {
    if (!input) return [];
    const rawTokens = (typeof input === 'string' ? input : String(input))
      .split(/[^0-9A-Za-z]+/)
      .map(t => t.trim())
      .filter(Boolean);
    let tokens = [...rawTokens];
    // If a token is digits-only and length is a multiple of 15, split into 15-digit IMEIs
    const expandToken = (t) => {
      if (/^\d+$/.test(t) && t.length >= 30 && t.length % 15 === 0) {
        const chunks = [];
        for (let i = 0; i < t.length; i += 15) chunks.push(t.slice(i, i + 15));
        return chunks;
      }
      return [t];
    };
    tokens = tokens.flatMap(expandToken);
    return tokens.map(t => t.toLowerCase());
  };
  const imeiTokens = parseImeis(imei);
  const hasMultiImei = imeiTokens.length > 1;
  
  return devices.filter(device => {
    const dImei = (device.imei || '').toString().toLowerCase();
    const imeiMatch = !imei
      ? true
      : hasMultiImei
        ? imeiTokens.some(token => dImei.includes(token))
        : (dImei && dImei.includes(imeiTokens[0] || String(imei).toLowerCase()));
    
    const immatriculationValue = (device.immatriculation || device.immat || '').toString();
    const immatriculationMatch = !immatriculation || immatriculationValue.toLowerCase().includes(immatriculation.toLowerCase());
    const entrepriseMatch = !entreprise || ((device.entreprise || '').toLowerCase().includes(entreprise.toLowerCase()));
    
    return imeiMatch && immatriculationMatch && entrepriseMatch;
  });
};

/**
 * Filter vehicles by company locally (client-side)
 */
export const filterVehiclesByCompanyLocal = (vehicles, companyId, companies) => {
  if (!companyId) return vehicles;
  
  const selectedCompany = companies.find(company => company.id === companyId);
  if (!selectedCompany) return [];
  
  return vehicles.filter(vehicle => vehicle.companyVehiclesId === companyId);
};

/**
 * Get device status locally (client-side)
 */
export const getDeviceStatusLocal = (devices, imei) => {
  const device = devices.find(device => device.imei === imei);
  
  if (!device) {
    return { found: false, message: 'Device not found' };
  }
  
  return { found: true, status: device.status };
};

/**
 * Filter by IMEI locally (client-side)
 */
export const filterByImeiLocal = (devices, imei) => {
  if (!imei) return devices;
  const raw = (typeof imei === 'string' ? imei : String(imei));
  let tokens = raw
    .split(/[^0-9A-Za-z]+/)
    .map(t => t.trim())
    .filter(Boolean);
  // Expand concatenated numeric strings into 15-digit chunks
  tokens = tokens.flatMap(t => {
    if (/^\d+$/.test(t) && t.length >= 30 && t.length % 15 === 0) {
      const chunks = [];
      for (let i = 0; i < t.length; i += 15) chunks.push(t.slice(i, i + 15));
      return chunks;
    }
    return [t];
  });
  if (tokens.length <= 1) {
    const term = (tokens[0] || raw).toLowerCase();
    return devices.filter(device => device.imei && device.imei.toLowerCase().includes(term));
  }
  const lowers = tokens.map(t => t.toLowerCase());
  return devices.filter(device => {
    const d = device.imei?.toLowerCase();
    if (!d) return false;
    return lowers.includes(d) || lowers.some(t => d.includes(t));
  });
};

/**
 * Filter by SIM locally (client-side)
 */
export const filterBySimLocal = (devices, sim) => {
  if (!sim) return devices;
  return devices.filter(device => device.telephone && device.telephone.toLowerCase().includes(sim.toLowerCase()));
};

/**
 * Filter by Vehicle locally (client-side)
 */
export const filterByVehicleLocal = (devices, vehicle) => {
  if (!vehicle || vehicle.trim() === '') return devices;
  const searchTerm = vehicle.toLowerCase().trim();
  return devices.filter(device => 
    device.immatriculation && 
    device.immatriculation.toLowerCase().includes(searchTerm)
  );
};

/**
 * Filter by Company locally (client-side)
 */
export const filterByCompanyLocal = (devices, company, companies) => {
  if (!company) return devices;
  
  const selectedCompany = companies.find(c => c.name === company);
  if (!selectedCompany) return [];
  
  return devices.filter(device => device.entreprise === company);
};

/**
 * OPTIMIZED: Get vehicles with empty IMEI with primary/fallback system and complete pagination
 */
export const fetchVehiclesWithEmptyImei = async (onProgressUpdate = null) => {
  return await withCredentialRetry(async () => {
    console.log('=== FETCHING VEHICLES WITH EMPTY IMEI WITH PROGRESSIVE DISPLAY ===');
    
    try {
      let allVehicles = [];
      let nextToken = null;
      let pageCount = 0;
      let totalNullItems = 0;
      let totalInvalidItems = 0;
      let totalNullCompanies = 0;
      
      // Iterate through all pages using pagination
      do {
        pageCount++;
        console.log(`Fetching vehicles with empty IMEI - Page ${pageCount}${nextToken ? ` (nextToken: ${nextToken.substring(0, 50)}...)` : ''}`);
        
        const response = await client.graphql({
          query: `query GetVehiclesWithEmptyImei($nextToken: String) {
            listVehicles(
              filter: {or: [{vehicleDeviceImei: {attributeExists: false}}, {vehicleDeviceImei: {eq: null}}, {vehicleDeviceImei: {eq: ""}}]}
              nextToken: $nextToken
              limit: 1000
            ) {
              items {
                companyVehiclesId
                device {
                  cid
                  name
                  protocolId
                  sim
                  imei
                  flespi_id
                  device_type_id
                }
                immatriculation
                immat
                companyVehiclesId
                vehicleDeviceImei
              }
              nextToken
            }
          }`,
          variables: { nextToken }
        });

        const rawItems = response.data.listVehicles.items;
        console.log(`Page ${pageCount}: ${rawItems.length} raw items received`);

        // STEP 1: Filter out null items and validate data
        const validVehicles = rawItems.filter(vehicle => {
          if (vehicle === null || vehicle === undefined) {
            console.warn('Filtered out null/undefined vehicle item');
            totalNullItems++;
            return false;
          }
          
          // Validate that vehicle has either immat or immatriculation
          if (!vehicle.immat && !vehicle.immatriculation) {
            console.warn('Filtered out vehicle with no immat/immatriculation:', vehicle);
            totalInvalidItems++;
            return false;
          }
          
          return true;
        });

        console.log(`Page ${pageCount}: ${validVehicles.length} valid vehicles after filtering (${totalNullItems} null, ${totalNullCompanies} null companies, ${totalInvalidItems} invalid)`);
        
        allVehicles = allVehicles.concat(validVehicles);
        nextToken = response.data.listVehicles.nextToken;
        
        console.log(`Page ${pageCount}: ${validVehicles.length} vehicles added, Total so far: ${allVehicles.length}`);
        
        // Call progress callback after each page with current results
        if (onProgressUpdate && allVehicles.length > 0) {
          // Fetch companies for mapping (simplified version for performance)
          try {
            const companiesResponse = await client.graphql({
              query: `query ListCompanyNames {\n                listCompanies(limit: 1000) {\n                  items { id name }\n                }\n              }`
            });
            const companies = companiesResponse.data.listCompanies.items;
            
            const progressVehicles = allVehicles.map(vehicle => {
              const company = companies.find(c => c.id === vehicle.companyVehiclesId);
              return {
                ...vehicle,
                id: vehicle.immat || vehicle.immatriculation,
                entreprise: company?.name || "Non définie",
                type: "vehicle",
                immatriculation: vehicle.immat || vehicle.immatriculation || "",
                nomVehicule: vehicle.nomVehicule || "",
                imei: "", // Empty by definition
                typeBoitier: "",
                marque: "",
                modele: "",
                kilometrage: "",
                telephone: "",
                emplacement: "",
                deviceData: null,
                isAssociated: false
              };
            });
            
            onProgressUpdate([...progressVehicles]); // Send copy of current results
          } catch (companyError) {
            console.warn('Error fetching companies for progress update:', companyError);
          }
        }
        
      } while (nextToken);

      console.log(`=== PAGINATION COMPLETE: ${pageCount} pages, ${allVehicles.length} total valid vehicles with empty IMEI ===`);
      console.log(`=== FILTERED OUT: ${totalNullItems} null items, ${totalNullCompanies} null companies, ${totalInvalidItems} invalid items ===`);

      // Fetch all companies to match with vehicles
      const companiesResponse = await client.graphql({
      query: `query ListCompanyNames {\n        listCompanies(limit: 1000) {\n          items { id name }\n        }\n      }`
    });
      const companies = companiesResponse.data.listCompanies.items;
      
      const vehicles = allVehicles.map(vehicle => {
        const company = companies.find(c => c.id === vehicle.companyVehiclesId);
        return {
          ...vehicle,
          id: vehicle.immat || vehicle.immatriculation,
          entreprise: company?.name || "Non définie",
          type: "vehicle",
          immatriculation: vehicle.immat || vehicle.immatriculation || "",
          nomVehicule: vehicle.nomVehicule || "",
          imei: "", // Empty by definition
          typeBoitier: "",
          marque: "",
          modele: "",
          kilometrage: "",
          telephone: "",
          emplacement: "",
          deviceData: null,
          isAssociated: false
        };
      });
      
      console.log('=== WORKING FILTER SUCCESS WITH COMPLETE PAGINATION ===');
      console.log('Total vehicles with empty IMEI found:', vehicles.length);
      console.log('Total items filtered out:', totalNullItems + totalNullCompanies + totalInvalidItems);
      
      return vehicles;
      
    } catch (error) {
      console.error('=== ERROR WITH WORKING FILTER ===');
      console.error('Error details:', error);
      // STEP 2: Improved error handling - preserve original error details
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      console.error('Original error details:', {
        message: error?.message,
        stack: error?.stack,
        graphQLErrors: error?.errors
      });
      throw new Error(`Erreur lors de la récupération des véhicules sans IMEI: ${errorMessage}`);
    }
  });
};

/**
 * OPTIMIZED: Get vehicles without devices using working filter with complete pagination
 */
export const fetchVehiclesWithoutDevices = async () => {
  return await withCredentialRetry(async () => {
    console.log('=== FETCHING VEHICLES WITHOUT DEVICES WITH COMPLETE PAGINATION ===');
    
    try {
      let allVehicles = [];
      let nextToken = null;
      let pageCount = 0;
      let totalNullItems = 0;
      let totalInvalidItems = 0;
      let totalNullCompanies = 0;
      
      // Iterate through all pages using pagination
      do {
        pageCount++;
        console.log(`Fetching vehicles without devices - Page ${pageCount}${nextToken ? ` (nextToken: ${nextToken.substring(0, 50)}...)` : ''}`);
        
        const response = await client.graphql({
          query: `query ListVehiclesWithoutDevices($nextToken: String) {
            listVehicles(
              filter: {or: [{vehicleDeviceImei: {attributeExists: false}}, {vehicleDeviceImei: {eq: null}}, {vehicleDeviceImei: {eq: ""}}]}
              nextToken: $nextToken
              limit: 1000
            ) {
               items {
                companyVehiclesId
                device {
                  cid
                  name
                  protocolId
                  sim
                  imei
                  flespi_id
                  device_type_id
                }
                immatriculation
                immat
                vehicleDeviceImei
               }
              nextToken
            }
          }`,
          variables: { nextToken }
        });
        
        const rawItems = response.data.listVehicles.items;
        console.log(`Page ${pageCount}: ${rawItems.length} raw items received`);

        // STEP 1: Filter out null items and validate data
        const validVehicles = rawItems.filter(vehicle => {
          if (vehicle === null || vehicle === undefined) {
            console.warn('Filtered out null/undefined vehicle item');
            totalNullItems++;
            return false;
          }
          
          // Validate that vehicle has either immat or immatriculation
          if (!vehicle.immat && !vehicle.immatriculation) {
            console.warn('Filtered out vehicle with no immat/immatriculation:', vehicle);
            totalInvalidItems++;
            return false;
          }
          
          return true;
        });

        console.log(`Page ${pageCount}: ${validVehicles.length} valid vehicles after filtering (${totalNullItems} null, ${totalNullCompanies} null companies, ${totalInvalidItems} invalid)`);
        
        allVehicles = allVehicles.concat(validVehicles);
        nextToken = response.data.listVehicles.nextToken;
        
        console.log(`Page ${pageCount}: ${validVehicles.length} vehicles without devices added, Total so far: ${allVehicles.length}`);
        
      } while (nextToken);
      
      console.log(`=== PAGINATION COMPLETE: ${pageCount} pages, ${allVehicles.length} total vehicles without devices ===`);
      console.log(`=== FILTERED OUT: ${totalNullItems} null items, ${totalNullCompanies} null companies, ${totalInvalidItems} invalid items ===`);
      
      // Fetch all companies to match with vehicles
      const companiesResponse = await client.graphql({
        query: `query ListCompanyNames {\n          listCompanies(limit: 1000) {\n            items { id name }\n          }\n        }`
      });
      const companies = companiesResponse.data.listCompanies.items;
      
      const vehicles = allVehicles.map(vehicle => {
        const company = companies.find(c => c.id === vehicle.companyVehiclesId);
        return {
          ...vehicle,
          id: vehicle.immat || vehicle.immatriculation,
          entreprise: company?.name || "Non définie",
          type: "vehicle",
          immatriculation: vehicle.immat || vehicle.immatriculation || "",
          nomVehicule: vehicle.nomVehicule || "",
          imei: "", // Empty by definition since these are vehicles without devices
          typeBoitier: "",
          marque: "",
          modele: "",
          kilometrage: "",
          telephone: "",
          emplacement: "",
          deviceData: null,
          isAssociated: false
        };
      });
      
      console.log('Vehicles without devices found:', vehicles.length);
      console.log('Sample vehicles:', vehicles.slice(0, 3).map(v => ({
        immat: v.immatriculation,
        company: v.entreprise,
        vehicleDeviceImei: v.vehicleDeviceImei
      })));
      
      return vehicles;
    } catch (error) {
      console.error('Error fetching vehicles without devices:', error);
      // Improved error handling
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      console.error('Original error details:', {
        message: error?.message,
        stack: error?.stack,
        graphQLErrors: error?.errors
      });
      throw new Error(`Erreur lors de la récupération des véhicules sans devices: ${errorMessage}`);
    }
  });
};

/**
 * OPTIMIZED: Get devices without vehicles - uses simplified GraphQL query
 */
export const fetchDevicesWithoutVehicles = async () => {
  console.log('=== STARTING FETCH DEVICES WITHOUT VEHICLES ===');
  
  try {
    // Ensure Amplify is configured and user is authenticated
    await waitForAmplifyConfig();
    console.log('Amplify config confirmed for devices fetch');
    
    // Check credentials before making the request
    const hasCredentials = await ensureCredentials();
    if (!hasCredentials) {
      console.error('No valid credentials found for devices fetch');
      throw new Error('Utilisateur non authentifié - veuillez vous reconnecter');
    }
    console.log('Credentials confirmed for devices fetch');
    
    return await withCredentialRetry(async () => {
      console.log('=== OPTIMIZED SEARCH: DEVICES WITHOUT VEHICLES (PAGINATED) ===');
      
      try {
        let allDevices = [];
        let nextToken = null;
        let page = 0;
        const pageSize = 500; // Reduced from 1000 for better stability
        
        do {
          page++;
          
          try {
            // Add timeout and retry for individual GraphQL calls
            const response = await Promise.race([
              client.graphql({
                query: `query ListFreeDevices($nextToken: String, $limit: Int) {
                  listDevices(
                    filter: { or: [
                      { deviceVehicleImmat: { attributeExists: false } },
                      { deviceVehicleImmat: { eq: null } },
                      { deviceVehicleImmat: { eq: "" } }
                    ]},
                    limit: $limit,
                    nextToken: $nextToken
                  ) {
                    items {
                      imei
                      sim
                      protocolId
                      name
                    }
                    nextToken
                  }
                }`,
                variables: { nextToken, limit: pageSize }
              }),
              // 30 second timeout per page
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('GraphQL timeout')), 30000)
              )
            ]);
            
            const pageItems = response.data?.listDevices?.items || [];
            allDevices = allDevices.concat(pageItems);
            nextToken = response.data?.listDevices?.nextToken || null;
            console.log(`Devices page ${page}: +${pageItems.length}, total=${allDevices.length}`);
            
          } catch (pageError) {
            console.warn(`Error on page ${page}, continuing with partial data:`, pageError);
            // Log the actual GraphQL error details
            if (pageError.errors) {
              console.error('GraphQL errors:', pageError.errors);
            }
            // Stop pagination on error but return what we have
            break;
          }
          
          // Safety limit to prevent infinite loops
          if (page >= 50) {
            console.warn('Reached maximum page limit (50), stopping pagination');
            break;
          }
          
        } while (nextToken);

        const devices = allDevices.map(device => ({
          id: device.imei,
          entreprise: "Boîtier libre",
          type: "device",
          immatriculation: "",
          nomVehicule: device.name || "",
          imei: device.imei,
          typeBoitier: device.protocolId?.toString() || "",
          marque: "",
          modele: "",
          kilometrage: "",
          telephone: device.sim || "",
          emplacement: "",
          deviceData: device,
          isAssociated: false
        }));

        console.log('Devices without vehicles found (merged):', devices.length);
        return devices;
        
      } catch (error) {
        console.error('Error in devices fetch GraphQL call:', error);
        // Log the full error for debugging
        if (error.errors) {
          console.error('Detailed GraphQL errors:', error.errors);
        }
        console.error('Error stack:', error.stack);
        
        // Return empty array instead of throwing to allow partial data loading
        console.warn('Returning empty device list due to error, allowing vehicles to load');
        return [];
      }
    }, 3);
  } catch (error) {
    console.error('Error in fetchDevicesWithoutVehicles outer catch:', error);
    throw error;
  }
};

/**
 * OPTIMIZED: Get stats for unassociated items
 */
export const fetchUnassociatedItemsStats = async () => {
  return await withCredentialRetry(async () => {
    console.log('=== FETCHING UNASSOCIATED ITEMS STATS ===');
    
    try {
      // Fetch vehicles without devices
      const vehiclesWithoutDevicesResponse = await client.graphql({
        query: `query ListVehiclesWithoutDevicesCount {
          listVehicles(filter: {or: [{vehicleDeviceImei: {attributeExists: false}}, {vehicleDeviceImei: {eq: null}}, {vehicleDeviceImei: {eq: ""}}]}) {
            items {
              immat
            }
          }
        }`
      });
      
      const vehiclesWithoutDevicesCount = vehiclesWithoutDevicesResponse.data.listVehicles.items.length;
      
      // Fetch devices without vehicles - using all devices and filtering client side
      const allDevicesResponse = await client.graphql({
        query: queries.listDevices,
        variables: { limit: 1000 }
      });
      
      const devicesWithoutVehicles = allDevicesResponse.data.listDevices.items.filter(device => !device.vehicle);
      
      const devicesWithoutVehiclesCount = devicesWithoutVehicles.length;
      
      // Fetch total vehicles
      const totalVehiclesResponse = await client.graphql({
        query: `query ListTotalVehiclesCount {
          listVehicles {
            items {
              immat
            }
          }
        }`
      });
      
      const totalVehicles = totalVehiclesResponse.data.listVehicles.items.length;
      
      // Fetch total devices
      const totalDevicesResponse = await client.graphql({
        query: `query ListTotalDevicesCount {
          listDevices {
            items {
              imei
            }
          }
        }`
      });
      
      const totalDevices = totalDevicesResponse.data.listDevices.items.length;
      
      console.log('Unassociated items stats:', {
        vehiclesWithoutDevicesCount,
        devicesWithoutVehiclesCount,
        totalVehicles,
        totalDevices
      });
      
      return {
        vehiclesWithoutDevicesCount,
        devicesWithoutVehiclesCount,
        totalVehicles,
        totalDevices
      };
    } catch (error) {
      console.error('Error fetching unassociated items stats:', error);
      throw error;
    }
  });
};
