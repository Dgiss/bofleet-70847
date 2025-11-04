import { waitForAmplifyConfig } from '@/config/aws-config.js';
import { associateDeviceToVehicleUnique } from './DeviceUniqueAssociationService.js';



/**
 * Associate a device to a vehicle using CORRECT GraphQL relations
 * @param {string} deviceImei - Device IMEI
 * @param {string} vehicleImmat - Vehicle immatriculation
 * @returns {Promise<Object>} Association result
 */
export const associateDeviceToVehicle = async (deviceImei, vehicleImmat) => {
  await waitForAmplifyConfig();
  
  try {
    // Use unique association service that validates one device per vehicle
    return await associateDeviceToVehicleUnique(deviceImei, vehicleImmat, false);
  } catch (error) {
    throw error;
  }
};

/**
 * Get free devices from cache (devices not associated with vehicles) - FIXED GRAPHQL
 * @param {Array} cachedVehicles - Cached vehicles data
 * @returns {Array} Free devices
 */
export const getFreeDevicesFromCache = (cachedVehicles) => {
  if (!cachedVehicles) return [];
  
  // FIXED: Use GraphQL relations - devices without vehicleImmat
  const freeDevices = cachedVehicles.filter(item => 
    item.type === "device" && 
    !item.isAssociated &&
    !item.vehicleImmat // GraphQL relation field
  );
  
  
  return freeDevices;
};

/**
 * Get vehicles available for association from cache (vehicles without device) - FIXED GRAPHQL
 * @param {Array} cachedVehicles - Cached vehicles data
 * @param {string} companyId - Company ID
 * @returns {Array} Available vehicles
 */
export const getAvailableVehiclesFromCache = (cachedVehicles, companyId) => {
  if (!cachedVehicles) return [];
  
  // FIXED: Use GraphQL relations - vehicles without device
  const availableVehicles = cachedVehicles.filter(item => 
    item.type === "vehicle" && 
    item.companyVehiclesId === companyId &&
    !item.device?.imei // GraphQL relation check
  );
  
  
  return availableVehicles;
};