
import axios from 'axios';
import { getFlespiApiKey, hasFlespiApiKey } from './ApiConfigService';

const FLESPI_API_URL = 'https://flespi.io/gw/devices';

/**
 * Get authorization headers with configured API key
 * @returns {Object|null} Headers object or null if no key configured
 */
const getAuthHeaders = () => {
  const apiKey = getFlespiApiKey();
  
  if (!apiKey) {
    throw new Error('Flespi API key not configured. Please configure your API key in settings.');
  }
  
  return {
    'Authorization': `FlespiToken ${apiKey}`
  };
};

/**
 * Add a device to Flespi platform
 * @param {Object} deviceDetails - Device details including IMEI and constructor
 * @returns {Promise<number|null>} Device ID if created, null if already exists
 */
export const addDeviceToFlespi = async (deviceDetails) => {
  if (!hasFlespiApiKey()) {
    throw new Error('Flespi API key not configured. Please configure your API key in settings.');
  }

  const headers = getAuthHeaders();
  
  const device = [{
    device_type_id: 68,
    name: deviceDetails.constructor || deviceDetails.imei,
    configuration: {
      ident: deviceDetails.imei.toString(),
    },
  }];
  
  try {
    console.log('Adding device to Flespi:', deviceDetails.imei);
    const response = await axios.post(FLESPI_API_URL, device, { headers });
    console.log('Device added successfully to Flespi:', response.data.result[0].id);
    return response.data.result[0].id;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('Device already exists in Flespi. Skipping creation process for:', deviceDetails.imei);
      return null;
    } else if (error.response && error.response.status === 401) {
      throw new Error('Invalid or expired Flespi API key. Please check your API key configuration.');
    } else {
      console.error('Error adding device to Flespi:', error.message);
      throw error;
    }
  }
};

/**
 * Remove a device from Flespi platform
 * @param {string} deviceId - Flespi device ID
 * @returns {Promise<boolean>} Success status
 */
export const removeDeviceFromFlespi = async (deviceId) => {
  if (!hasFlespiApiKey()) {
    throw new Error('Flespi API key not configured. Please configure your API key in settings.');
  }

  const headers = getAuthHeaders();
  
  try {
    console.log('Removing device from Flespi:', deviceId);
    await axios.delete(`${FLESPI_API_URL}/${deviceId}`, { headers });
    console.log('Device removed successfully from Flespi:', deviceId);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid or expired Flespi API key. Please check your API key configuration.');
    }
    console.error('Error removing device from Flespi:', error.message);
    throw error;
  }
};

/**
 * Get device information from Flespi
 * @param {string} deviceId - Flespi device ID
 * @returns {Promise<Object>} Device information
 */
export const getDeviceFromFlespi = async (deviceId) => {
  if (!hasFlespiApiKey()) {
    throw new Error('Flespi API key not configured. Please configure your API key in settings.');
  }

  const headers = getAuthHeaders();
  
  try {
    const response = await axios.get(`${FLESPI_API_URL}/${deviceId}`, { headers });
    return response.data.result;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid or expired Flespi API key. Please check your API key configuration.');
    }
    console.error('Error getting device from Flespi:', error.message);
    throw error;
  }
};
