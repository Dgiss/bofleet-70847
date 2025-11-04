import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import * as simpleMutations from '../graphql/mutations-simple';
import { withCredentialRetry, getLazyClient } from '@/config/aws-config.js';

const client = getLazyClient();

/**
 * Check if vehicle exists by immatriculation
 * @param {string} immat - Vehicle immatriculation
 * @returns {Promise<boolean>} True if vehicle exists
 */
export const checkVehicleExists = async (immat) => {
  return await withCredentialRetry(async () => {
    try {
      const result = await client.graphql({
        query: queries.getVehicle,
        variables: { immat: immat }
      });
      
      return !!result.data.getVehicle;
    } catch (error) {
      // If error (vehicle not found), vehicle doesn't exist
      console.log('Vehicle does not exist:', immat);
      return false;
    }
  });
};

/**
 * Extract meaningful error message from GraphQL error
 * @param {Object} graphqlError - GraphQL error object
 * @returns {string} Extracted error message
 */
const extractGraphQLErrorMessage = (graphqlError) => {
  console.log('=== EXTRACTING GRAPHQL ERROR MESSAGE ===');
  console.log('GraphQL error object:', graphqlError);
  
  // Try to get message from errors array first
  if (graphqlError.errors && graphqlError.errors.length > 0) {
    const firstError = graphqlError.errors[0];
    console.log('First error details:', firstError);
    
    if (firstError.message) {
      console.log('Extracted error message:', firstError.message);
      
      // Handle specific DynamoDB conditional request failed error
      if (firstError.message.includes('conditional request failed') || 
          firstError.message.includes('ConditionalCheckFailedException')) {
        return 'Cette immatriculation existe déjà. Veuillez utiliser une immatriculation différente ou associer le boîtier au véhicule existant.';
      }
      
      // Handle other common DynamoDB errors
      if (firstError.message.includes('ValidationException')) {
        return 'Données invalides. Veuillez vérifier les champs obligatoires.';
      }
      
      return firstError.message;
    }
  }
  
  // Fallback to top-level message
  if (graphqlError.message) {
    console.log('Using top-level error message:', graphqlError.message);
    
    // Handle specific errors in top-level message
    if (graphqlError.message.includes('conditional request failed') || 
        graphqlError.message.includes('ConditionalCheckFailedException')) {
      return 'Cette immatriculation existe déjà. Veuillez utiliser une immatriculation différente ou associer le boîtier au véhicule existant.';
    }
    
    return graphqlError.message;
  }
  
  // Last fallback
  console.log('No specific error message found, using generic');
  return 'Erreur lors de l\'opération GraphQL';
};

/**
 * Validate required fields for vehicle creation/update
 * @param {Object} vehicleData - Vehicle data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @throws {Error} If required fields are missing or invalid
 */
const validateVehicleData = (vehicleData, isUpdate = false) => {
  console.log('=== VALIDATING VEHICLE DATA ===');
  console.log('Vehicle data to validate:', vehicleData);
  console.log('Is update operation:', isUpdate);
  
  const immat = vehicleData.immatriculation || vehicleData.immat;
  if (!immat || immat.trim() === '') {
    throw new Error('Immatriculation is required and cannot be empty');
  }
  
  if (!vehicleData.companyVehiclesId || vehicleData.companyVehiclesId.trim() === '') {
    throw new Error('Company ID (companyVehiclesId) is required and cannot be empty');
  }
  
  console.log('Vehicle data validation passed');
  console.log('- immat:', immat);
  console.log('- companyVehiclesId:', vehicleData.companyVehiclesId);
};

/**
 * Clean and normalize vehicle immatriculation
 * @param {string} immat - Raw immatriculation
 * @returns {string} Cleaned immatriculation
 */
const cleanImmatriculation = (immat) => {
  if (!immat) return immat;
  return immat.trim().toUpperCase();
};

/**
 * Clean vehicle input data - preserve required fields even if empty
 * @param {Object} vehicleInput - Raw vehicle input
 * @returns {Object} Cleaned vehicle input
 */
const cleanVehicleInput = (vehicleInput) => {
  console.log('=== CLEANING VEHICLE INPUT ===');
  console.log('Raw input:', vehicleInput);
  
  const cleaned = { ...vehicleInput };
  
  // Clean and normalize immatriculation fields
  if (cleaned.immat) {
    cleaned.immat = cleanImmatriculation(cleaned.immat);
  }
  if (cleaned.realImmat) {
    cleaned.realImmat = cleanImmatriculation(cleaned.realImmat);
  }
  
  // Required fields that must never be removed
  const requiredFields = ['immat', 'realImmat', 'companyVehiclesId'];
  
  // Remove undefined values and empty strings, but preserve required fields
  Object.keys(cleaned).forEach(key => {
    const value = cleaned[key];
    
    if (requiredFields.includes(key)) {
      // Keep required fields, but validate they're not empty
      if (value === '' || value === null || value === undefined) {
        console.warn(`Warning: Required field ${key} is empty or null`);
      }
    } else {
      // For non-required fields, remove undefined, null, and empty values
      if (value === undefined || value === '' || value === null) {
        delete cleaned[key];
      }
    }
  });
  
  console.log('Cleaned input:', cleaned);
  console.log('Required fields check:');
  requiredFields.forEach(field => {
    console.log(`- ${field}:`, cleaned[field]);
  });
  
  return cleaned;
};

/**
 * Create vehicle with enhanced error handling
 * @param {Object} vehicleData - Vehicle data
 * @returns {Promise<Object>} Created vehicle
 */
export const createVehicleSimple = async (vehicleData) => {
  console.log('=== CREATING VEHICLE SIMPLE (ENHANCED ERROR HANDLING) ===');
  console.log('Vehicle data:', vehicleData);
  
  try {
    // Validate required fields first
    validateVehicleData(vehicleData, false);
    
    const immat = vehicleData.immatriculation || vehicleData.immat;
    
    // Map form data to GraphQL schema
    const vehicleInput = {
      immat: immat,
      realImmat: immat, // Add the missing realImmat field - use same value as immat
      companyVehiclesId: vehicleData.companyVehiclesId,
      code: vehicleData.code || null,
      nomVehicule: vehicleData.nomVehicule || null,
      kilometerage: vehicleData.kilometrage ? parseInt(vehicleData.kilometrage) : null,
      locations: vehicleData.emplacement || null,
      marque: vehicleData.marque || null,
      modele_id: vehicleData.modele || null,
      energie: vehicleData.energie || null,
      couleur: vehicleData.couleur || null,
      dateMiseEnCirculation: vehicleData.dateMiseEnCirculation || null,
      VIN: vehicleData.VIN || null,
      AWN_nom_commercial: vehicleData.AWN_nom_commercial || null,
      puissanceFiscale: vehicleData.puissanceFiscale ? parseInt(vehicleData.puissanceFiscale) : null,
      lastModificationDate: new Date().toISOString(),
      vehicleDeviceImei: vehicleData.vehicleDeviceImei || vehicleData.imei || null
    };
    
    // Clean the input
    const cleanedInput = cleanVehicleInput(vehicleInput);
    
    // Final validation before GraphQL call
    console.log('=== FINAL PRE-GRAPHQL VALIDATION ===');
    console.log('Cleaned input being sent to GraphQL:', cleanedInput);
    
    // Ensure required fields are present and valid
    if (!cleanedInput.immat || cleanedInput.immat.trim() === '') {
      throw new Error('Pre-GraphQL validation failed: immat is required');
    }
    if (!cleanedInput.realImmat || cleanedInput.realImmat.trim() === '') {
      throw new Error('Pre-GraphQL validation failed: realImmat is required');
    }
    if (!cleanedInput.companyVehiclesId || cleanedInput.companyVehiclesId.trim() === '') {
      throw new Error('Pre-GraphQL validation failed: companyVehiclesId is required');
    }
    
    console.log('Pre-GraphQL validation passed');
    console.log('Calling createVehicle mutation with:', cleanedInput);
    
    const result = await withCredentialRetry(async () => {
      try {
        return await client.graphql({
          query: simpleMutations.createVehicleSimple,
          variables: { input: cleanedInput }
        });
      } catch (graphqlError) {
        console.error('=== ENHANCED GRAPHQL ERROR DETAILS ===');
        console.error('Full error object:', graphqlError);
        console.error('Error data:', graphqlError.data);
        console.error('Error errors array:', graphqlError.errors);
        console.error('Error message (top-level):', graphqlError.message);
        
        if (graphqlError.errors && graphqlError.errors.length > 0) {
          graphqlError.errors.forEach((err, index) => {
            console.error(`GraphQL Error ${index + 1}:`, {
              message: err.message,
              path: err.path,
              locations: err.locations,
              errorType: err.errorType,
              errorInfo: err.errorInfo
            });
          });
        }
        
        // Extract meaningful error message
        const errorMessage = extractGraphQLErrorMessage(graphqlError);
        console.error('Extracted error message:', errorMessage);
        
        // Re-throw with extracted message
        throw new Error(`GraphQL createVehicle failed: ${errorMessage}`);
      }
    });
    
    console.log('Vehicle created successfully:', result.data.createVehicle);
    return result.data.createVehicle;
    
  } catch (error) {
    console.error('=== CREATE VEHICLE ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('required')) {
      throw new Error(`Validation failed: ${error.message}`);
    } else if (error.message.includes('GraphQL')) {
      throw new Error(`Database error: ${error.message}`);
    } else {
      throw new Error(`Vehicle creation failed: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Update vehicle with enhanced error handling
 * @param {Object} vehicleData - Vehicle data
 * @returns {Promise<Object>} Updated vehicle
 */
export const updateVehicleSimple = async (vehicleData) => {
  console.log('=== UPDATING VEHICLE SIMPLE (FIXED FOR ERRORS) ===');
  console.log('Vehicle data:', vehicleData);
  
  try {
    const immat = vehicleData.immatriculation || vehicleData.immat;
    if (!immat) {
      throw new Error('Immatriculation is required for update');
    }
    
    // Check if vehicle exists first
    const vehicleExists = await checkVehicleExists(immat);
    if (!vehicleExists) {
      console.log('Vehicle does not exist, creating instead of updating');
      return await createVehicleSimple(vehicleData);
    }
    
    // For updates, only include fields that are actually being modified
    // Keep it minimal to avoid schema conflicts
    const vehicleInput = {
      immat: immat, // Required key field
    };
    
    // Only add fields that have actual values (not null/undefined/empty)
    if (vehicleData.companyVehiclesId) {
      vehicleInput.companyVehiclesId = vehicleData.companyVehiclesId;
    }
    if (vehicleData.code) {
      vehicleInput.code = vehicleData.code;
    }
    if (vehicleData.nomVehicule) {
      vehicleInput.nomVehicule = vehicleData.nomVehicule;
    }
    if (vehicleData.kilometrage) {
      vehicleInput.kilometerage = parseInt(vehicleData.kilometrage);
    }
    if (vehicleData.emplacement) {
      vehicleInput.locations = vehicleData.emplacement;
    }
    if (vehicleData.marque) {
      vehicleInput.marque = vehicleData.marque;
    }
    if (vehicleData.modele) {
      vehicleInput.modele_id = vehicleData.modele;
    }
    if (vehicleData.energie) {
      vehicleInput.energie = vehicleData.energie;
    }
    if (vehicleData.couleur) {
      vehicleInput.couleur = vehicleData.couleur;
    }
    if (vehicleData.dateMiseEnCirculation) {
      vehicleInput.dateMiseEnCirculation = vehicleData.dateMiseEnCirculation;
    }
    if (vehicleData.VIN) {
      vehicleInput.VIN = vehicleData.VIN;
    }
    if (vehicleData.AWN_nom_commercial) {
      vehicleInput.AWN_nom_commercial = vehicleData.AWN_nom_commercial;
    }
    if (vehicleData.puissanceFiscale) {
      vehicleInput.puissanceFiscale = parseInt(vehicleData.puissanceFiscale);
    }
    if (vehicleData.vehicleDeviceImei !== undefined || vehicleData.imei !== undefined) {
      vehicleInput.vehicleDeviceImei = vehicleData.vehicleDeviceImei || vehicleData.imei || null;
    }
    
    // Always update modification date
    vehicleInput.lastModificationDate = new Date().toISOString();
    
    console.log('Calling updateVehicle mutation with minimal input:', vehicleInput);
    
    const result = await withCredentialRetry(async () => {
      try {
        return await client.graphql({
          query: simpleMutations.updateVehicleSimple,
          variables: { input: vehicleInput }
        });
      } catch (graphqlError) {
        console.error('=== UPDATE ENHANCED GRAPHQL ERROR DETAILS ===');
        console.error('Full error object:', graphqlError);
        console.error('Error data:', graphqlError.data);
        console.error('Error errors array:', graphqlError.errors);
        
        // Log detailed error information
        if (graphqlError.errors && graphqlError.errors.length > 0) {
          console.error('🔍 DETAILED GRAPHQL ERRORS:');
          graphqlError.errors.forEach((err, index) => {
            console.error(`❌ Update GraphQL Error ${index + 1}:`, {
              message: err.message,
              path: err.path,
              errorType: err.errorType,
              errorInfo: err.errorInfo,
              locations: err.locations,
              extensions: err.extensions
            });
            
            // Log the raw error message for debugging
            console.error(`Raw error message ${index + 1}:`, err.message);
          });
        }
        
        // Check if the operation actually succeeded despite errors
        if (graphqlError.data?.updateVehicle) {
          console.log('✅ Update succeeded despite GraphQL errors');
          return graphqlError; // Return the response with data
        }
        
        // Extract meaningful error message
        const errorMessage = extractGraphQLErrorMessage(graphqlError);
        console.error('Extracted update error message:', errorMessage);
        
        throw new Error(`GraphQL updateVehicle failed: ${errorMessage}`);
      }
    });
    
    console.log('Vehicle updated successfully:', result.data.updateVehicle);
    return result.data.updateVehicle;
    
  } catch (error) {
    console.error('=== UPDATE VEHICLE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw new Error(`Vehicle update failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Create or update vehicle with automatic detection and enhanced error handling
 * @param {Object} vehicleData - Vehicle data
 * @returns {Promise<Object>} Created or updated vehicle
 */
export const createOrUpdateVehicleSimple = async (vehicleData) => {
  console.log('=== CREATE OR UPDATE VEHICLE SIMPLE (AVEC DEVICE) ===');
  console.log('Vehicle data:', vehicleData);
  
  try {
    const immat = vehicleData.immatriculation || vehicleData.immat;
    if (!immat) {
      throw new Error('Immatriculation is required');
    }

    // Clean the immatriculation
    const cleanImmat = cleanImmatriculation(immat);
    
    // Check if vehicle exists
    const vehicleExists = await checkVehicleExists(cleanImmat);
    
    if (vehicleExists) {
      console.log('Vehicle exists, updating...');
      return await updateVehicleSimple({
        ...vehicleData,
        immatriculation: cleanImmat,
        immat: cleanImmat
      });
    } else {
      console.log('Vehicle does not exist, creating...');
      
      // Check if we need to create a device with this vehicle
      if (vehicleData.imei && vehicleData.deviceCreated) {
        console.log('Creating vehicle with device association...');
        return await createVehicleSimple({
          ...vehicleData,
          immatriculation: cleanImmat,
          immat: cleanImmat,
          vehicleDeviceImei: vehicleData.imei || vehicleData.vehicleDeviceImei
        });
      } else {
        console.log('Creating vehicle without device...');
        return await createVehicleSimple({
          ...vehicleData,
          immatriculation: cleanImmat,
          immat: cleanImmat
        });
      }
    }
  } catch (error) {
    console.error('=== CREATE OR UPDATE VEHICLE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Provide more specific error messages for common issues
    if (error.message.includes('immatriculation existe déjà')) {
      throw new Error(`Impossible de créer le véhicule : ${error.message}`);
    } else if (error.message.includes('required')) {
      throw new Error(`Validation échouée : ${error.message}`);
    } else if (error.message.includes('GraphQL')) {
      throw new Error(`Erreur de base de données : ${error.message}`);
    } else {
      throw new Error(`Échec de traitement du véhicule : ${error.message || 'Erreur inconnue'}`);
    }
  }
};
