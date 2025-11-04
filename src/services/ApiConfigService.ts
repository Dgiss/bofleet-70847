
/**
 * Service for managing API configurations (Flespi API keys, etc.)
 */

const FLESPI_API_KEY_STORAGE = 'flespi_api_key';

export interface FlespiConfig {
  apiKey: string;
  isValid?: boolean;
  lastValidated?: string;
}

/**
 * Store Flespi API key in localStorage
 */
export const setFlespiApiKey = (apiKey: string): void => {
  try {
    localStorage.setItem(FLESPI_API_KEY_STORAGE, apiKey);
    console.log('Flespi API key stored successfully');
  } catch (error) {
    console.error('Error storing Flespi API key:', error);
    throw new Error('Failed to store API key');
  }
};

/**
 * Get Flespi API key from localStorage
 */
export const getFlespiApiKey = (): string | null => {
  try {
    return localStorage.getItem(FLESPI_API_KEY_STORAGE);
  } catch (error) {
    console.error('Error retrieving Flespi API key:', error);
    return null;
  }
};

/**
 * Remove Flespi API key from localStorage
 */
export const removeFlespiApiKey = (): void => {
  try {
    localStorage.removeItem(FLESPI_API_KEY_STORAGE);
    console.log('Flespi API key removed');
  } catch (error) {
    console.error('Error removing Flespi API key:', error);
  }
};

/**
 * Check if Flespi API key is configured
 */
export const hasFlespiApiKey = (): boolean => {
  const apiKey = getFlespiApiKey();
  return apiKey !== null && apiKey.trim().length > 0;
};

/**
 * Validate Flespi API key by making a test request
 */
export const validateFlespiApiKey = async (apiKey?: string): Promise<boolean> => {
  const keyToTest = apiKey || getFlespiApiKey();
  
  if (!keyToTest) {
    return false;
  }

  try {
    const response = await fetch('https://flespi.io/gw/devices?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `FlespiToken ${keyToTest}`
      }
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error validating Flespi API key:', error);
    return false;
  }
};
