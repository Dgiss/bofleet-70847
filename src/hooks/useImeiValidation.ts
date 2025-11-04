import { useState } from 'react';
import SimpleDeviceService from '@/services/SimpleDeviceService';

export const useImeiValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Check if IMEI exists in the database and get device details
   */
  const checkImei = async (imei: string): Promise<{exists: boolean, device?: any, isAssociated?: boolean}> => {
    if (!imei || imei.trim() === '') {
      return { exists: false };
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const isAvailable = await SimpleDeviceService.checkImeiAvailable(imei);
      
      if (isAvailable) {
        // IMEI n'existe pas - disponible pour création
        return { exists: false, isAssociated: false };
      } else {
        // IMEI existe déjà - vérifier s'il est associé
        try {
          const deviceDetails = await SimpleDeviceService.getDeviceByImei(imei);
          const isAssociated = !!deviceDetails?.vehicleDeviceImmat;
          return { 
            exists: true, 
            device: deviceDetails,
            isAssociated 
          };
        } catch (error) {
          // Si on ne peut pas obtenir les détails, on suppose qu'il existe mais on ne sait pas s'il est associé
          return { exists: true, isAssociated: false };
        }
      }
    } catch (error: any) {
      console.error('Error checking IMEI:', error);
      setValidationError(error.message || 'Erreur lors de la vérification de l\'IMEI');
      return { exists: false };
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Validate IMEI format (15 digits)
   */
  const validateImeiFormat = (imei: string): {isValid: boolean, error?: string, cleanImei?: string} => {
    if (!imei || imei.trim() === '') {
      return { isValid: false, error: 'L\'IMEI est requis' };
    }

    const cleanImei = imei.replace(/[^0-9]/g, '');

    if (cleanImei.length !== 15) {
      return { 
        isValid: false, 
        error: `L'IMEI doit contenir 15 chiffres (actuellement ${cleanImei.length})` 
      };
    }

    if (!/^\d{15}$/.test(cleanImei)) {
      return { isValid: false, error: 'L\'IMEI doit contenir uniquement des chiffres' };
    }

    return { isValid: true, cleanImei };
  };

  const clearValidationError = () => {
    setValidationError(null);
  };

  return {
    isValidating,
    validationError,
    checkImei,
    validateImeiFormat,
    clearValidationError
  };
};
