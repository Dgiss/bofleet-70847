import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { waitForAmplifyConfig, withCredentialRetry, getLazyClient } from '@/config/aws-config.js';
import { addDeviceToFlespi } from './FlespiService.js';
import { hasFlespiApiKey } from './ApiConfigService';
import { checkImeiAvailable, createDeviceSimple, associateDeviceToVehicleSimple } from './SimpleDeviceService.js';

const client = getLazyClient();

export const fetchAllDevices = async () => {
  return await withCredentialRetry(async () => {
    console.log('=== FETCHING ALL DEVICES (SECURED) ===');
    
    // Simplified inline GraphQL query to avoid nested field errors
    const SIMPLE_LIST_DEVICES = `
      query ListDevicesSimple($limit: Int, $nextToken: String) {
        listDevices(limit: $limit, nextToken: $nextToken) {
          items {
            imei
            sim
            protocolId
            name
            deviceVehicleImmat
            enabled
            createdAt
            updatedAt
          }
          nextToken
        }
      }
    `;
    
    let allDevices = [];
    let nextToken = null;
    
    do {
      const variables = {
        limit: 1000,
        nextToken: nextToken
      };
      
      console.log('Fetching devices batch with variables:', variables);
      
      try {
        const deviceList = await client.graphql({
          query: SIMPLE_LIST_DEVICES,
          variables: variables
        });
        
        const data = deviceList.data.listDevices;
        console.log('Devices batch received:', data.items.length);
        
        allDevices = allDevices.concat(data.items);
        nextToken = data.nextToken;
        
      } catch (error) {
        console.error('Error fetching devices:', error);
        if (error.errors) {
          console.error('GraphQL errors:', error.errors);
        }
        // If we have partial data, use it instead of throwing
        if (error.data?.listDevices?.items) {
          console.log('Using partial device data from error response');
          allDevices = allDevices.concat(error.data.listDevices.items);
          nextToken = error.data.listDevices.nextToken;
        } else {
          throw new Error(`Failed to fetch devices: ${error.message}`);
        }
      }
      
    } while (nextToken);
    
    console.log('Total devices fetched:', allDevices.length);
    return allDevices;
  });
};

/**
 * Create a new device using simplified logic
 * @param {Object} deviceData - Device data including IMEI, SIM, etc.
 * @returns {Promise<Object>} Created device
 */
export const createDevice = async (deviceData) => {
  console.log('=== CREATING DEVICE (SIMPLIFIED) ===');
  console.log('Input data:', deviceData);
  
  // Use the new simplified device creation
  return await createDeviceSimple(deviceData);
};

/**
 * Update an existing device
 * @param {Object} deviceData - Updated device data
 * @returns {Promise<Object>} Updated device
 */
export const updateDevice = async (deviceData) => {
  return await withCredentialRetry(async () => {
  
  const deviceDetails = {
    imei: deviceData.imei,
    sim: deviceData.sim,
    protocolId: deviceData.protocolId,
  };
  
  // Remove undefined values to avoid GraphQL errors
  Object.keys(deviceDetails).forEach(key => {
    if (deviceDetails[key] === undefined || deviceDetails[key] === null) {
      delete deviceDetails[key];
    }
  });
  
  try {
    const response = await client.graphql({
      query: mutations.updateDevice,
      variables: {
        input: deviceDetails
      }
    });
    
    console.log('Device updated successfully:', response.data.updateDevice);
    return response.data.updateDevice;
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
  });
};

/**
 * Delete a device
 * @param {Object} deviceData - Device data with IMEI
 * @returns {Promise<boolean>} Success status
 */
export const deleteDevice = async (deviceData) => {
  return await withCredentialRetry(async () => {
  
  try {
    await client.graphql({
      query: mutations.deleteDevice,
      variables: {
        input: { imei: deviceData.imei }
      }
    });
    
    console.log('Device deleted successfully:', deviceData.imei);
    return true;
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
  });
};

/**
 * Check if a device exists by IMEI and if it's already associated
 * @param {string} imei - Device IMEI to check
 * @returns {Promise<{exists: boolean, isAssociated: boolean, vehicleImmat: string|null}>}
 */
export const checkDeviceExists = async (imei) => {
  return await withCredentialRetry(async () => {
    try {
      // Check if device exists
      const isAvailable = await checkImeiAvailable(imei);
      const exists = !isAvailable;
      
      if (!exists) {
        return { exists: false, isAssociated: false, vehicleImmat: null };
      }
      
      // If device exists, check if it's associated with a vehicle
      const GET_DEVICE = `
        query GetDevice($imei: String!) {
          getDevice(imei: $imei) {
            imei
            deviceVehicleImmat
          }
        }
      `;
      
      const response = await client.graphql({
        query: GET_DEVICE,
        variables: { imei }
      });
      
      const device = response.data.getDevice;
      const isAssociated = !!device?.deviceVehicleImmat;
      
      return {
        exists: true,
        isAssociated,
        vehicleImmat: device?.deviceVehicleImmat || null
      };
      
    } catch (error) {
      console.error('Error checking device:', error);
      throw error;
    }
  });
};

/**
 * OBSOLÈTE: Cette fonction a été remplacée par la logique optimisée
 * La nouvelle approche consiste à créer le device en premier, puis le véhicule avec l'IMEI
 * @deprecated Utiliser SimpleDeviceService.createDeviceSimple + SimpleVehicleService.createVehicleSimple avec vehicleDeviceImei
 */
export const createDeviceWithVehicleAssociation = async (data) => {
  console.log('⚠️ ATTENTION: Fonction obsolète appelée. Utilisation de la nouvelle logique optimisée...');
  
  try {
    // Nouvelle logique optimisée : device d'abord, puis véhicule avec IMEI
    const { createDeviceSimple, updateDeviceSimple } = await import('./SimpleDeviceService.js');
    const { createVehicleSimple } = await import('./SimpleVehicleService.js');
    
    const imeiList = data.imeiList || [data.imei];
    const validImeis = [];
    const errors = [];
    
    // Vérifier et créer les devices d'abord
    for (const imei of imeiList) {
      if (!imei?.trim()) continue;
      
      try {
        // Créer le device
        const device = await createDeviceSimple({
          imei: imei.trim(),
          sim: data.sim,
          protocolId: data.protocolId,
          constructor: data.constructor
        });
        
        validImeis.push(imei.trim());
        console.log('✅ Device créé:', device.imei);
      } catch (deviceError) {
        console.error(`❌ Erreur création device ${imei}:`, deviceError);
        errors.push(`${imei} (${deviceError.message})`);
      }
    }
    
    if (validImeis.length === 0) {
      throw new Error('Aucun device n\'a pu être créé');
    }
    
    // Créer le véhicule avec le premier IMEI valide
    const primaryImei = validImeis[0];
    const createdVehicle = await createVehicleSimple({
      immatriculation: data.immatriculation,
      categorie: data.categorie,
      marque: data.brand,
      modele: data.modele,
      companyVehiclesId: data.companyVehiclesId,
      nomVehicule: data.nomVehicule,
      emplacement: data.emplacement,
      kilometrage: data.kilometrage,
      vehicleDeviceImei: primaryImei // Association directe
    });
    
    console.log('✅ Véhicule créé avec device associé:', createdVehicle.immat, '→', primaryImei);
    
    // CRITICAL FIX: Update the Device table with the vehicle immat
    try {
      await updateDeviceSimple({
        imei: primaryImei,
        deviceVehicleImmat: data.immatriculation
      });
      console.log('✅ Device table updated with vehicle association:', primaryImei, '→', data.immatriculation);
    } catch (updateError) {
      console.error('❌ Error updating device with vehicle immat:', updateError);
      // Non-blocking error, the association is still created via the vehicle side
    }
    
    const successfulDevices = validImeis.map(imei => ({
      imei: imei,
      sim: data.sim || '',
      deviceVehicleImmat: data.immatriculation,
      id: imei,
      vehicle: { company: { name: data.company?.name || '' } }
    }));
    
    return {
      success: successfulDevices.length > 0,
      successCount: successfulDevices.length,
      errorCount: errors.length,
      devices: successfulDevices,
      errors: errors,
      vehicle: createdVehicle
    };
    
  } catch (error) {
    console.error('Error in createDeviceWithVehicleAssociation (nouvelle logique):', error);
    throw error;
  }
};

// Helper function to determine device type/name from protocolId
export const getDeviceTypeName = (protocolId) => {
  const deviceTypeMap = {
    '1': 'Tracker GPS Standard',
    '2': 'Tracker GPS Avancé',
    '3': 'Boîtier Teltonika',
    '4': 'Dispositif OBD',
    '5': 'Tracker Magnétique',
    // Add more mappings as needed
  };
  
  return deviceTypeMap[protocolId] || 'GPS Tracker';
};

// Export the new simplified functions and the main function
export { 
  checkImeiAvailable, 
  createDeviceSimple, 
  associateDeviceToVehicleSimple
};
