
import { useState, useCallback } from 'react';
import { getLazyClient } from '@/config/aws-config.js';
import * as queries from '../graphql/queries';
import { withCredentialRetry } from '@/config/aws-config.js';

const client = getLazyClient();

/**
 * Custom hook for vehicle validation
 */
export const useVehicleValidation = () => {
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Check if a vehicle with the given immatriculation already exists
   */
  const checkImmatriculation = useCallback(async (immat: string): Promise<{exists: boolean, vehicle?: any}> => {
    if (!immat || immat.trim() === '') {
      return { exists: false };
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Clean and normalize immatriculation
      const cleanImmat = immat.trim().toUpperCase();
      
      const result = await withCredentialRetry(async () => {
        return await client.graphql({
          query: queries.getVehicle,
          variables: { immat: cleanImmat }
        });
      });

      const vehicle = result.data.getVehicle;
      return { 
        exists: !!vehicle, 
        vehicle: vehicle 
      };
    } catch (error) {
      // If error is "not found", vehicle doesn't exist
      if (error.message && error.message.includes('not found')) {
        return { exists: false };
      }
      
      
      setValidationError('Erreur lors de la vérification de l\'immatriculation');
      return { exists: false };
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Validate and clean immatriculation format
   */
  const validateImmatFormat = useCallback((immat: string): {isValid: boolean, error?: string, cleanImmat?: string} => {
    if (!immat || immat.trim() === '') {
      return { isValid: false, error: 'L\'immatriculation est obligatoire' };
    }

    const cleanImmat = immat.trim().toUpperCase();
    
    // Basic validation - at least 2 characters
    if (cleanImmat.length < 2) {
      return { isValid: false, error: 'L\'immatriculation doit contenir au moins 2 caractères' };
    }

    // Check for valid characters (letters, numbers, hyphens, and spaces)
    const validPattern = /^[A-Z0-9\s-]+$/;
    if (!validPattern.test(cleanImmat)) {
      return { isValid: false, error: 'L\'immatriculation contient des caractères non valides' };
    }

    return { isValid: true, cleanImmat };
  }, []);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  return {
    isValidating,
    validationError,
    checkImmatriculation,
    validateImmatFormat,
    clearValidationError
  };
};

export default useVehicleValidation;
