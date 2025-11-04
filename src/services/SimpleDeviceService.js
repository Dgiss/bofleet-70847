
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { withCredentialRetry, getLazyClient } from '@/config/aws-config.js';
import { addDeviceToFlespi } from './FlespiService.js';
import { hasFlespiApiKey } from './ApiConfigService';

const client = getLazyClient();

/**
 * Check if IMEI is available (doesn't exist in database)
 * @param {string} imei - IMEI to check
 * @returns {Promise<boolean>} True if available, false if exists
 */
export const checkImeiAvailable = async (imei) => {
  return await withCredentialRetry(async () => {
    try {
      const result = await client.graphql({
        query: queries.getDevice,
        variables: { imei: imei }
      });
      
      // If device exists, IMEI is not available
      return !result.data.getDevice;
    } catch (error) {
      // If error (device not found), IMEI is available
      console.log('IMEI is available:', imei);
      return true;
    }
  });
};

/**
 * Create device with simple logic: check availability, create in DB and Flespi
 * @param {Object} deviceData - Device data
 * @returns {Promise<Object>} Created device or existing device
 */
export const createDeviceSimple = async (deviceData) => {
  return await withCredentialRetry(async () => {
    console.log('=== CREATING DEVICE SIMPLE (NO ASSOCIATION) ===');
    console.log('Device data:', deviceData);
    
    // Validate required fields
    if (!deviceData.imei) {
      throw new Error('IMEI is required');
    }
    
    // Step 1: Check if IMEI is available
    const isAvailable = await checkImeiAvailable(deviceData.imei);
    if (!isAvailable) {
      console.log('IMEI already exists, fetching existing device');
      const existingDevice = await client.graphql({
        query: queries.getDevice,
        variables: { imei: deviceData.imei }
      });
      return existingDevice.data.getDevice;
    }
    
    // Step 2: Create in database using direct mutation
    const deviceInput = {
      imei: String(deviceData.imei),
      sim: deviceData.sim ? String(deviceData.sim) : undefined,
      protocolId: deviceData.protocolId ? Number(deviceData.protocolId) : undefined,
      enabled: deviceData.enabled !== undefined ? Boolean(deviceData.enabled) : true
    };
    
    // Remove undefined values
    Object.keys(deviceInput).forEach(key => {
      if (deviceInput[key] === undefined) {
        delete deviceInput[key];
      }
    });
    
    console.log('Creating device in database:', deviceInput);
    
    try {
      const dbResult = await client.graphql({
        query: mutations.createDevice,
        variables: { input: deviceInput }
      });
      
      const createdDevice = dbResult.data.createDevice;
      console.log('✅ Device created successfully:', createdDevice.imei);
      
      // Step 3: Create in Flespi (optional, don't fail if it doesn't work)
      try {
        if (hasFlespiApiKey()) {
          const flespiId = await addDeviceToFlespi({
            imei: deviceData.imei,
            constructor: deviceData.constructor || deviceData.imei
          });
          
          if (flespiId) {
            // Update device with Flespi ID
            await client.graphql({
              query: mutations.updateDevice,
              variables: {
                input: {
                  imei: deviceData.imei,
                  flespiDeviceId: Number(flespiId)
                }
              }
            });
            console.log('Device updated with Flespi ID:', flespiId);
          }
        } else {
          console.warn('Flespi API key not configured, skipping Flespi creation');
        }
      } catch (flespiError) {
        console.warn('Flespi creation failed but continuing:', flespiError.message);
      }
      
      return createdDevice;
    } catch (error) {
      console.error('Error creating device - Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      
      // Si l'erreur contient des données partielles (device créé avec erreurs), récupérer le device
      if (error.data && error.data.createDevice) {
        console.log('Device created successfully despite errors:', error.data.createDevice);
        return error.data.createDevice;
      }
      
      // Log détaillé des erreurs GraphQL
      if (error.errors && Array.isArray(error.errors)) {
        console.error(`📋 GraphQL Errors during device creation (${error.errors.length} errors):`);
        error.errors.forEach((err, index) => {
          console.error(`🔴 Error ${index + 1}:`, {
            message: err.message,
            path: err.path,
            locations: err.locations,
            extensions: err.extensions
          });
        });
      }
      if (error.message?.includes('DataCloneError') || error.message?.includes('URL object could not be cloned')) {
        console.error('Erreur de sérialisation des données. Tentative de récupération...');
        
        // Essayer de créer avec des données plus simples
        const simpleInput = {
          imei: String(deviceData.imei),
          enabled: true
        };
        
        try {
          const retryResult = await client.graphql({
            query: mutations.createDevice,
            variables: { input: simpleInput }
          });
          
          console.log('Device created with simple data:', retryResult.data.createDevice);
          return retryResult.data.createDevice;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          throw new Error(`Impossible de créer le dispositif: ${retryError.message}`);
        }
      }
      
      throw error;
    }
  });
};

/**
 * Update device fields (sim, protocolId) by IMEI
 * @param {{ imei: string, sim?: string, protocolId?: number }} params
 * @returns {Promise<Object>} Updated device
 */
export const updateDeviceSimple = async ({ imei, sim, protocolId, deviceVehicleImmat }) => {
  return await withCredentialRetry(async () => {
    if (!imei) throw new Error('IMEI is required');

    const input = { imei: String(imei) };
    if (sim !== undefined && sim !== null && String(sim).trim() !== '') input.sim = String(sim);
    if (protocolId !== undefined && protocolId !== null && String(protocolId).trim() !== '') input.protocolId = Number(protocolId);
    
    // Add deviceVehicleImmat support for association
    if (deviceVehicleImmat !== undefined) {
      input.deviceVehicleImmat = deviceVehicleImmat ? String(deviceVehicleImmat) : null;
    }

    const result = await client.graphql({
      query: mutations.updateDevice,
      variables: { input }
    });
    return result.data.updateDevice;
  });
};

/**
 * Associate device to vehicle with complete bidirectional relationship
 * @param {string} vehicleImmat - Vehicle immatriculation
 * @param {string} deviceImei - Device IMEI
 * @returns {Promise<Object>} Updated vehicle and device
 */
export const associateDeviceToVehicleSimple = async (vehicleImmat, deviceImei) => {
  return await withCredentialRetry(async () => {
    console.log('=== ASSOCIATING DEVICE TO VEHICLE (BIDIRECTIONAL) ===');
    console.log('Vehicle:', vehicleImmat, 'Device:', deviceImei);
    
    try {
      // Step 1: Update vehicle with device IMEI
      console.log('Step 1: Updating vehicle with device IMEI...');
      const vehicleResult = await client.graphql({
        query: mutations.updateVehicle,
        variables: {
          input: {
            immat: vehicleImmat,
            vehicleDeviceImei: deviceImei
          }
        }
      });
      
      console.log('✅ Vehicle updated with device IMEI:', vehicleResult.data.updateVehicle);
      
      // Step 2: Update device with vehicle immat (for belongsTo relationship)
      console.log('Step 2: Updating device with vehicle immat...');
      try {
        const deviceResult = await client.graphql({
          query: mutations.updateDevice,
          variables: {
            input: {
              imei: deviceImei,
              deviceVehicleImmat: vehicleImmat
            }
          }
        });
        
        console.log('✅ Device updated with vehicle immat:', deviceResult.data.updateDevice);
      } catch (deviceError) {
        console.warn('⚠️ Failed to update device with vehicle association, but vehicle association succeeded:', deviceError);
        console.warn('Device error details:', deviceError.message);
      }
      
      console.log('🎉 Bidirectional association completed successfully');
      return vehicleResult.data.updateVehicle;
      
    } catch (associationError) {
      console.error('❌ Error during association process:', associationError);
      console.error('Association error message:', associationError.message);
      console.error('Association error name:', associationError.name);
      
      if (associationError.errors && Array.isArray(associationError.errors)) {
        console.error(`📋 GraphQL Errors during association (${associationError.errors.length} errors):`);
        associationError.errors.forEach((err, index) => {
          console.error(`🔴 Association Error ${index + 1}:`, {
            message: err.message,
            path: err.path,
            locations: err.locations,
            extensions: err.extensions
          });
        });
      }
      
      throw associationError;
    }
  });
};

/**
 * Delete device from database
 * @param {string} imei - Device IMEI to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteDevice = async (imei) => {
  return await withCredentialRetry(async () => {
    console.log('=== DELETING DEVICE ===');
    console.log('Device IMEI:', imei);
    
    try {
      // Check if device exists and get its details
      const deviceResult = await client.graphql({
        query: queries.getDevice,
        variables: { imei: imei }
      });
      
      if (!deviceResult.data.getDevice) {
        throw new Error('Device not found');
      }
      
      // Delete the device
      const deleteResult = await client.graphql({
        query: mutations.deleteDevice,
        variables: { input: { imei: imei } }
      });
      
      console.log('✅ Device deleted successfully:', imei);
      return deleteResult.data.deleteDevice;
      
    } catch (error) {
      console.error('❌ Error deleting device:', error);
      throw error;
    }
  });
};

// Default export for the service
const SimpleDeviceService = {
  checkImeiAvailable,
  createDeviceSimple,
  associateDeviceToVehicleSimple,
  deleteDevice
};

export default SimpleDeviceService;
