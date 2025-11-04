import { generateClient } from 'aws-amplify/api';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { waitForAmplifyConfig, withCredentialRetry } from '@/config/aws-config.js';
import { fetchAllDevices } from './DeviceService.js';
import { cleanDataForGraphQL } from '@/lib/utils';
import { createVehicleSimple, updateVehicleSimple } from './SimpleVehicleService.js';

const client = generateClient();

export const fetchAllVehiclesOptimized = async () => {
  return await withCredentialRetry(async () => {
    
    
    try {
      let allVehicles = [];
      let nextToken = null;
      let pageCount = 0;
      
      // Première page sans nextToken
      
      
      const firstResponse = await client.graphql({
        query: `query FirstPage {
          listVehicles(limit: 1000) {
            items {
              immat
              immatriculation
              companyVehiclesId
              vehicleDeviceImei
              device {
                name
                imei
                sim
                device_type_id
              }
            }
            nextToken
          }
        }`
      });



      const firstPageVehicles = firstResponse.data?.listVehicles?.items || [];
      allVehicles = allVehicles.concat(firstPageVehicles);
      nextToken = firstResponse.data?.listVehicles?.nextToken;
      pageCount = 1;


      // Pages suivantes seulement si nextToken existe
      while (nextToken && pageCount < 100) { // Augmenté à 100 pages pour vos 19000 véhicules
        pageCount++;
        
        
        try {
          const response = await client.graphql({
            query: `query NextPage($nextToken: String!) {
              listVehicles(limit: 1000, nextToken: $nextToken) {
                items {
                  immat
                  immatriculation
                  companyVehiclesId
                  vehicleDeviceImei
                  device {
                    name
                    imei
                    sim
                    device_type_id
                  }
                }
                nextToken
              }
            }`,
            variables: { nextToken }
          });

          if (response.errors) {
            console.error(`⚠️ Erreurs GraphQL page ${pageCount}:`, response.errors);
            response.errors.forEach((error, i) => {
              console.error(`Erreur GraphQL ${i + 1}:`, error.message);
            });
            // CONTINUER malgré les erreurs GraphQL si on a des données
            if (!response.data?.listVehicles?.items) {
              console.error(`❌ Pas de données page ${pageCount}, arrêt`);
              break;
            }
            console.log(`⚠️ Données partielles page ${pageCount}, on continue`);
          }

          const pageVehicles = response.data?.listVehicles?.items || [];
          allVehicles = allVehicles.concat(pageVehicles);
          nextToken = response.data?.listVehicles?.nextToken;
          
          console.log(`✅ Page ${pageCount}: ${pageVehicles.length} véhicules`);
          console.log(`Total actuel: ${allVehicles.length} véhicules`);
          console.log(`NextToken pour page ${pageCount + 1}: ${nextToken ? 'OUI' : 'NON'}`);
          
        } catch (pageError) {
          console.error(`❌ Erreur page ${pageCount}:`, pageError?.message || 'Message undefined');
          console.error('Type erreur:', typeof pageError);
          
          // Extraire les détails de l'erreur GraphQL si disponible
          if (pageError?.errors) {
            console.error('Erreurs GraphQL dans catch:', pageError.errors);
            pageError.errors.forEach((error, i) => {
              console.error(`GraphQL Error ${i + 1}:`, error.message);
            });
          }
          
          // RÉCUPÉRER LES DONNÉES PARTIELLES (c'est ça le point clé !)
          if (pageError?.data?.listVehicles?.items) {
            console.log(`💾 RÉCUPÉRATION données partielles page ${pageCount}...`);
            const partialVehicles = pageError.data.listVehicles.items || [];
            allVehicles = allVehicles.concat(partialVehicles);
            nextToken = pageError.data.listVehicles.nextToken;
            
            console.log(`✅ Page ${pageCount} (avec erreurs mais données récupérées): ${partialVehicles.length} véhicules`);
            console.log(`📈 NOUVEAU TOTAL: ${allVehicles.length} véhicules`);
            console.log(`🔄 NextToken pour page ${pageCount + 1}: ${nextToken ? 'OUI - ON CONTINUE' : 'NON - FINI'}`);
            
            // CONTINUER la pagination avec les données partielles
            // N'utilisez PAS break ici !
          } else {
            console.error(`❌ Pas de données récupérables page ${pageCount}, arrêt pagination`);
            break;
          }
        }
      }

      console.log(`🎉 Pagination terminée: ${pageCount} pages, ${allVehicles.length} véhicules total`);

      // Transformation simple et sûre
      const mappedVehicles = allVehicles.map((vehicle, index) => {
        try {
          return {
            id: vehicle?.immat || vehicle?.immatriculation || `vehicle-${index}`,
            type: "vehicle",
            immatriculation: vehicle?.immat || vehicle?.immatriculation || "",
            entreprise: vehicle?.company?.name || "Non définie",
            imei: vehicle?.device?.imei || vehicle?.vehicleDeviceImei || "",
            nomVehicule: vehicle?.device?.name || "",
            telephone: vehicle?.device?.sim || "",
            typeBoitier: vehicle?.device?.device_type_id?.toString() || "",
            isAssociated: !!(vehicle?.device?.imei || vehicle?.vehicleDeviceImei),
            companyVehiclesId: vehicle?.companyVehiclesId,
            vehicleDeviceImei: vehicle?.vehicleDeviceImei,
            deviceData: vehicle?.device || null,
            marque: "",
            modele: "",
            kilometrage: "",
            emplacement: ""
          };
        } catch (mapError) {
          console.error(`Erreur mapping véhicule ${index}:`, mapError);
          return null;
        }
      }).filter(Boolean);

      // Companies extraction sécurisée
      const companies = [];
      const seenCompanies = new Set();
      
      allVehicles.forEach((vehicle, index) => {
        try {
          if (vehicle?.company && vehicle?.companyVehiclesId && !seenCompanies.has(vehicle.companyVehiclesId)) {
            companies.push({
              id: vehicle.companyVehiclesId,
              name: vehicle.company.name
            });
            seenCompanies.add(vehicle.companyVehiclesId);
          }
        } catch (companyError) {
          console.warn(`Erreur extraction company véhicule ${index}:`, companyError);
        }
      });

      console.log('=== RÉSULTAT FINAL SÉCURISÉ ===');
      console.log(`🚗 Véhicules mappés: ${mappedVehicles.length}`);
      console.log(`🏢 Entreprises: ${companies.length}`);

      return {
        companies,
        vehicles: mappedVehicles
      };

    } catch (error) {
      console.error('❌ ERREUR DÉTAILLÉE:', {
        message: error?.message || 'Message non défini',
        stack: error?.stack || 'Stack non définie',
        name: error?.name || 'Nom non défini',
        errors: error?.errors || 'Pas d\'erreurs GraphQL',
        type: typeof error,
        fullError: error
      });
      
      throw new Error(`Erreur pagination: ${error?.message || 'Erreur inconnue'}`);
    }
  });
};

export const fetchCompaniesWithVehicles = async () => {
  return await withCredentialRetry(async () => {
    console.log('=== FETCHING COMPANIES WITH VEHICLES ===');
    let allCompanies = [];
    let allVehicles = [];
    let nextToken = null;
    
    // First, fetch all companies to get the list
    do {
      const variables = {
        limit: 1000,
        nextToken: nextToken
      };
      
      console.log('Fetching companies batch with variables:', variables);
      
      try {
        const companyList = await client.graphql({
          query: queries.listCompanies,
          variables: variables
        });
        
        const data = companyList.data.listCompanies;
        console.log('Companies batch received:', data.items.length);
        
        allCompanies = allCompanies.concat(data.items);
        nextToken = data.nextToken;
        
      } catch (error) {
        console.error('Error fetching companies:', error);
        if (error.errors) {
          console.error('GraphQL errors:', error.errors);
        }
        throw new Error(`Failed to fetch companies: ${error.message}`);
      }
      
    } while (nextToken);
    
    console.log('Total companies fetched:', allCompanies.length);
    
    // Fetch all devices for unassociated device handling
    const devices = await fetchAllDevices();
    console.log('=== DEVICE DEBUG INFO ===');
    console.log('Total devices fetched:', devices.length);
    
    // Now fetch vehicles for each company using vehiclesByCompanyVehiclesId
    let totalVehiclesFromCompanies = 0;
    for (const company of allCompanies) {
      console.log(`=== PROCESSING COMPANY: ${company.name} (ID: ${company.id}) ===`);
      
      try {
        let companyNextToken = null;
        do {
          const vehiclesResult = await client.graphql({
            query: queries.vehiclesByCompanyVehiclesId,
            variables: {
              companyVehiclesId: company.id,
              limit: 1000,
              nextToken: companyNextToken
            }
          });
          
          const vehiclesData = vehiclesResult.data.vehiclesByCompanyVehiclesId;
          console.log(`Company ${company.name} vehicles batch:`, vehiclesData.items.length);
          
          if (vehiclesData.items.length > 0) {
            console.log('Sample vehicle with relations:', JSON.stringify(vehiclesData.items[0], null, 2));
          }
          
          const companyVehicles = vehiclesData.items.map(vehicle => {
            console.log(`Processing vehicle: ${vehicle.immat}`);
            console.log('Vehicle company:', vehicle.company?.name);
            console.log('Vehicle device:', vehicle.device?.imei, 'SIM:', vehicle.device?.sim);
            
            const mappedVehicle = {
              ...vehicle,
              entreprise: vehicle.company?.name || company.name || "Non définie",
              type: "vehicle",
              immatriculation: vehicle.immat || "",
              nomVehicule: vehicle.nomVehicule || vehicle.code || "",
              imei: vehicle.vehicleDeviceImei || vehicle.device?.imei || "",
              typeBoitier: vehicle.device?.protocolId?.toString() || "",
              marque: vehicle.marque || vehicle.brand?.brandName || "",
              modele: vehicle.modele_id || vehicle.modele?.modele || "",
              kilometrage: vehicle.kilometerage?.toString() || "",
              telephone: vehicle.device?.sim || "",
              emplacement: vehicle.locations || "",
              deviceData: vehicle.device || null,
              // Use vehicleDeviceImei for association detection
              isAssociated: !!(vehicle.vehicleDeviceImei || vehicle.device?.imei),
              // Additional fields
              AWN_nom_commercial: vehicle.AWN_nom_commercial || "",
              energie: vehicle.energie || "",
              puissanceFiscale: vehicle.puissanceFiscale || "",
              couleur: vehicle.couleur || "",
              dateMiseEnCirculation: vehicle.dateMiseEnCirculation || "",
              VIN: vehicle.VIN || vehicle.AWN_VIN || ""
            };
            
            console.log(`Mapped vehicle ${vehicle.immat}: entreprise="${mappedVehicle.entreprise}", telephone="${mappedVehicle.telephone}"`);
            totalVehiclesFromCompanies++;
            return mappedVehicle;
          });
          
          allVehicles = allVehicles.concat(companyVehicles);
          companyNextToken = vehiclesData.nextToken;
          
        } while (companyNextToken);
        
      } catch (error) {
        console.error(`Error fetching vehicles for company ${company.name}:`, error);
      }
    }
    
    console.log('Total vehicles processed from companies:', totalVehiclesFromCompanies);
    
    // Find devices associated with vehicles (both via vehicleDeviceImei and device relation)
    const associatedDeviceImeis = new Set(
      allVehicles
        .map(v => v.vehicleDeviceImei || v.deviceData?.imei)
        .filter(Boolean)
    );
    
    const unassociatedDevices = devices
      .filter(device => device.imei && !associatedDeviceImeis.has(device.imei))
      .map(device => ({
        id: device.imei,
        entreprise: "Boîtier libre",
        type: "device",
        immatriculation: "",
        nomVehicule: "",
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
    
    console.log('Unassociated devices count:', unassociatedDevices.length);
    
    const allDevices = [...allVehicles, ...unassociatedDevices];
    
    console.log('=== FINAL RESULT SUMMARY ===');
    console.log('Total companies:', allCompanies.length);
    console.log('Total vehicles:', allVehicles.length);
    console.log('Total unassociated devices:', unassociatedDevices.length);
    console.log('Total combined data:', allDevices.length);
    
    // Debug company names for search
    const companyNames = [...new Set(allDevices.map(item => item.entreprise).filter(Boolean))];
    console.log('Available company names for search:', companyNames);
    
    return { companies: allCompanies, vehicles: allDevices };
  });
};

/**
 * Update vehicle data using simplified approach
 */
export const updateVehicleData = async (data) => {
  console.log('=== UPDATING VEHICLE DATA (SIMPLIFIED) ===');
  console.log('Input data:', data);
  
  return await updateVehicleSimple(data);
};

/**
 * Create vehicle data using simplified approach
 */
export const createVehicleData = async (data) => {
  console.log('=== CREATING VEHICLE DATA (SIMPLIFIED) ===');
  console.log('Input data:', data);
  
  return await createVehicleSimple(data);
};

export const deleteVehicleData = async (item) => {
  await waitForAmplifyConfig();
  
  // Clean data before sending to GraphQL
  const cleanedItem = cleanDataForGraphQL(item);
  
  const vehicleDetails = {
    immat: cleanedItem.immat || cleanedItem.immatriculation
  };

  console.log('Cleaned delete data for GraphQL:', vehicleDetails);

  await client.graphql({
    query: mutations.deleteVehicle,
    variables: { input: vehicleDetails }
  });
};

/**
 * Associate a vehicle to a device using vehicleDeviceImei field - SIMPLIFIED
 * @param {string} vehicleImmat - Vehicle immatriculation
 * @param {string} deviceImei - Device IMEI
 * @returns {Promise<Object>} Association result
 */
export const associateVehicleToDevice = async (vehicleImmat, deviceImei) => {
  return await withCredentialRetry(async () => {
    console.log('=== ASSOCIATING VEHICLE TO DEVICE (SIMPLIFIED) ===');
    console.log('Vehicle immat:', vehicleImmat);
    console.log('Device IMEI:', deviceImei);
    
    try {
      // First, check if the device is already associated to another vehicle
      const existingVehicleQuery = /* GraphQL */ `
        query CheckDeviceAssociation($deviceImei: String!) {
          listVehicles(filter: {vehicleDeviceImei: {eq: $deviceImei}}) {
            items {
              immat
              vehicleDeviceImei
            }
          }
        }
      `;

      const existingResponse = await client.graphql({
        query: existingVehicleQuery,
        variables: {
          deviceImei: deviceImei
        }
      });

      const existingVehicles = existingResponse.data?.listVehicles?.items || [];
      const otherVehicleWithDevice = existingVehicles.find(v => v.immat !== vehicleImmat);

      if (otherVehicleWithDevice) {
        throw new Error(`Le boîtier ${deviceImei} est déjà associé au véhicule ${otherVehicleWithDevice.immat}. Un boîtier ne peut être associé qu'à un seul véhicule.`);
      }

      const updateInput = {
        immat: vehicleImmat,
        vehicleDeviceImei: deviceImei
      };
      
      console.log('Update input:', updateInput);
      
      // Use a simple update mutation that only returns basic fields
      const simpleUpdateVehicle = /* GraphQL */ `
        mutation UpdateVehicle($input: UpdateVehicleInput!) {
          updateVehicle(input: $input) {
            immat
            vehicleDeviceImei
            updatedAt
            __typename
          }
        }
      `;

      const vehicleUpdate = await client.graphql({
        query: simpleUpdateVehicle,
        variables: {
          input: updateInput
        }
      });
      
      console.log('Vehicle-device association successful:', vehicleUpdate.data?.updateVehicle);
      
      return { success: true, vehicleUpdate: vehicleUpdate.data?.updateVehicle };
    } catch (error) {
      console.error('Error associating vehicle to device:', error);
      console.error('Error details:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      
      if (error.errors) {
        console.error('📋 GraphQL Errors during association (' + error.errors.length + ' errors):');
        error.errors.forEach((err, index) => {
          console.error(`🔴 Association Error ${index + 1}:`, err);
          console.error(`   Message: ${err.message}`);
          console.error(`   Path: ${JSON.stringify(err.path)}`);
          console.error(`   Locations: ${JSON.stringify(err.locations)}`);
          console.error(`   Extensions: ${JSON.stringify(err.extensions)}`);
        });
      }
      
      if (error.data) {
        console.error('Error data:', error.data);
      }
      
      throw error;
    }
  });
};

/**
 * Dissociate a vehicle from a device by removing vehicleDeviceImei
 * @param {string} vehicleImmat - Vehicle immatriculation
 * @returns {Promise<Object>} Dissociation result
 */
export const dissociateVehicleFromDevice = async (vehicleImmat) => {
  return await withCredentialRetry(async () => {
    console.log('=== DISSOCIATING VEHICLE FROM DEVICE ===');
    console.log('Vehicle immat:', vehicleImmat);
    
    try {
      const vehicleUpdate = await client.graphql({
        query: mutations.updateVehicle,
        variables: {
          input: {
            immat: vehicleImmat,
            vehicleDeviceImei: null
          }
        }
      });
      
      console.log('Vehicle-device dissociation successful:', vehicleUpdate.data?.updateVehicle);
      
      return { success: true, vehicleUpdate: vehicleUpdate.data?.updateVehicle };
    } catch (error) {
      console.error('Error dissociating vehicle from device:', error);
      console.error('Error details:', error.message);
      if (error.errors) {
        console.error('GraphQL errors:', error.errors);
      }
      throw error;
    }
  });
};

/**
 * Associate a device to a vehicle using GraphQL relations (LEGACY - kept for compatibility)
 * @param {string} deviceImei - Device IMEI
 * @param {string} vehicleImmat - Vehicle immatriculation
 * @returns {Promise<Object>} Association result
 */
export const associateDeviceToVehicle = async (deviceImei, vehicleImmat) => {
  // Use new method
  return await associateVehicleToDevice(vehicleImmat, deviceImei);
};
