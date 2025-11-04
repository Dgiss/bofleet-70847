import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { waitForAmplifyConfig, withCredentialRetry, getLazyClient } from '@/config/aws-config.js';
import { toast } from '@/hooks/use-toast';

const client = getLazyClient();

/**
 * Check if a device is already associated with another vehicle
 * @param {string} deviceImei - Device IMEI
 * @param {string} excludeVehicleImmat - Vehicle to exclude from check (for updates)
 * @returns {Promise<{isAssociated: boolean, vehicle?: Object}>}
 */
export const checkDeviceVehicleUniqueness = async (deviceImei, excludeVehicleImmat = null) => {
  try {
    // Ensure Amplify is properly configured with retry
    await withCredentialRetry(async () => {
      await waitForAmplifyConfig();
      return true;
    });
    
    console.log(`🔍 Checking uniqueness for device ${deviceImei} (exclude: ${excludeVehicleImmat})`);
    
    // Use minimal inline query to avoid nested field issues
    const minimalListVehicles = /* GraphQL */ `
      query ListVehiclesByImei($filter: ModelVehicleFilterInput, $limit: Int) {
        listVehicles(filter: $filter, limit: $limit) {
          items {
            immat
            vehicleDeviceImei
          }
          nextToken
        }
      }
    `;
    
    const vehiclesResponse = await client.graphql({
      query: minimalListVehicles,
      variables: {
        filter: {
          vehicleDeviceImei: { eq: deviceImei }
        },
        limit: 1
      }
    });
    
    const associatedVehicles = vehiclesResponse.data?.listVehicles?.items || [];
    
    if (associatedVehicles.length === 0) {
      return { isAssociated: false };
    }
    
    const associatedVehicleImmat = associatedVehicles[0].immat;
    
    // If excluding a specific vehicle (for updates), check if it's different
    if (excludeVehicleImmat && associatedVehicleImmat === excludeVehicleImmat) {
      return { isAssociated: false };
    }
    
    // Get vehicle details
    const vehicleResponse = await client.graphql({
      query: queries.getVehicle,
      variables: { immat: associatedVehicleImmat }
    });
    
    return {
      isAssociated: true,
      vehicle: vehicleResponse.data?.getVehicle,
      vehicleImmat: associatedVehicleImmat
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Associate device to vehicle with uniqueness validation
 * Manages all 3 tables: Trame, Device, and Vehicle
 * @param {string} deviceImei - Device IMEI
 * @param {string} vehicleImmat - Vehicle immatriculation
 * @param {boolean} forceAssociation - Force association even if device is already associated
 * @returns {Promise<Object>} Association result
 */
export const associateDeviceToVehicleUnique = async (deviceImei, vehicleImmat, forceAssociation = false) => {
  try {
    // Ensure Amplify is properly configured with retry
    await withCredentialRetry(async () => {
      await waitForAmplifyConfig();
      return true;
    });
    
    console.log(`🔄 Associating device ${deviceImei} to vehicle ${vehicleImmat}`);
    
    // Check if device is already associated
    const uniquenessCheck = await checkDeviceVehicleUniqueness(deviceImei, vehicleImmat);
    
    if (uniquenessCheck.isAssociated && !forceAssociation) {
      throw new Error(
        `Le boîtier ${deviceImei} est déjà associé au véhicule ${uniquenessCheck.vehicleImmat}. ` +
        `Un boîtier ne peut être associé qu'à un seul véhicule à la fois.`
      );
    }
    
    // If already associated to another vehicle and force is enabled, dissociate first
    if (uniquenessCheck.isAssociated && forceAssociation) {
      console.log(`🔄 Force mode: dissociating ${deviceImei} from ${uniquenessCheck.vehicleImmat}`);
      await dissociateDeviceFromVehicle(deviceImei);
    }
    
    // Check if the target vehicle already has a device associated
    const minimalGetVehicle = /* GraphQL */ `
      query GetVehicle($immat: String!) {
        getVehicle(immat: $immat) {
          immat
          vehicleDeviceImei
          companyVehiclesId
          __typename
        }
      }
    `;
    
    const vehicleResponse = await client.graphql({
      query: minimalGetVehicle,
      variables: { immat: vehicleImmat }
    });
    
    const targetVehicle = vehicleResponse.data?.getVehicle;
    const oldDeviceImei = targetVehicle?.vehicleDeviceImei;
    const companyId = targetVehicle?.companyVehiclesId;
    
    // If target vehicle has an old device, dissociate it first
    if (oldDeviceImei && oldDeviceImei !== deviceImei) {
      console.log(`🔄 Target vehicle has old device ${oldDeviceImei}, dissociating it first`);
      await dissociateDeviceFromVehicle(oldDeviceImei);
    }
    
    // Step 1: Check if Trame exists, if not create it, otherwise update it
    console.log(`📝 Step 1: Checking/Creating/Updating Trame (id: ${deviceImei})`);
    
    const minimalGetTrame = /* GraphQL */ `
      query GetTrame($id: String!) {
        getTrame(id: $id) {
          id
          trameVehicleImmat
          __typename
        }
      }
    `;
    
    let trameExists = false;
    try {
      const trameResponse = await client.graphql({
        query: minimalGetTrame,
        variables: { id: deviceImei }
      });
      trameExists = !!trameResponse.data?.getTrame;
    } catch (error) {
      trameExists = false;
    }
    
    if (trameExists) {
      // Update existing Trame
      const minimalUpdateTrame = /* GraphQL */ `
        mutation UpdateTrame($input: UpdateTrameInput!) {
          updateTrame(input: $input) {
            id
            trameVehicleImmat
            __typename
          }
        }
      `;
      
      await client.graphql({
        query: minimalUpdateTrame,
        variables: {
          input: {
            id: deviceImei,
            trameVehicleImmat: vehicleImmat,
            companyTramesId: companyId
          }
        }
      });
      console.log(`✅ Trame updated for ${deviceImei}`);
    } else {
      // Create new Trame
      const minimalCreateTrame = /* GraphQL */ `
        mutation CreateTrame($input: CreateTrameInput!) {
          createTrame(input: $input) {
            id
            trameVehicleImmat
            __typename
          }
        }
      `;
      
      try {
        await client.graphql({
          query: minimalCreateTrame,
          variables: {
            input: {
              id: deviceImei,
              trameVehicleImmat: vehicleImmat,
              companyTramesId: companyId
            }
          }
        });
        console.log(`✅ Trame created for ${deviceImei}`);
      } catch (createError) {
        console.log(`ℹ️ Could not create Trame for ${deviceImei}, will be created on first data`);
      }
    }
    
    // Step 2: Update Device to point to new vehicle
    console.log(`📝 Step 2: Updating Device (imei: ${deviceImei}, immat: ${vehicleImmat})`);
    const minimalUpdateDevice = /* GraphQL */ `
      mutation UpdateDevice($input: UpdateDeviceInput!) {
        updateDevice(input: $input) {
          imei
          deviceVehicleImmat
          __typename
        }
      }
    `;
    
    await client.graphql({
      query: minimalUpdateDevice,
      variables: {
        input: {
          imei: deviceImei,
          deviceVehicleImmat: vehicleImmat
        }
      }
    });
    console.log(`✅ Device updated for ${deviceImei}`);
    
    // Step 3: Update Vehicle to point to new device
    console.log(`📝 Step 3: Updating Vehicle (immat: ${vehicleImmat}, imei: ${deviceImei})`);
    const minimalUpdateVehicle = /* GraphQL */ `
      mutation UpdateVehicle($input: UpdateVehicleInput!) {
        updateVehicle(input: $input) {
          immat
          vehicleDeviceImei
          updatedAt
          __typename
        }
      }
    `;

    const updateResult = await client.graphql({
      query: minimalUpdateVehicle,
      variables: {
        input: {
          immat: vehicleImmat,
          vehicleDeviceImei: deviceImei
        }
      }
    });
    
    const vehicleData = updateResult.data?.updateVehicle;
    if (!vehicleData || !vehicleData.vehicleDeviceImei) {
      console.error('Association failed - no vehicleDeviceImei in response');
      throw new Error('Association échouée - véhicule non mis à jour');
    }
    console.log(`✅ Vehicle updated for ${vehicleImmat}`);

    // Log success but ignore nullable field errors
    if (updateResult.errors && updateResult.errors.length > 0) {
      console.log('GraphQL nullable field errors (ignored):', updateResult.errors.map(e => e.message));
    }
    
    // Return only simple serializable data
    const cleanVehicleData = {
      immat: vehicleData.immat || vehicleImmat,
      vehicleDeviceImei: vehicleData.vehicleDeviceImei || deviceImei,
      isAssociated: true,
      type: 'vehicle'
    };
    
    console.log('✅ Association successful:', cleanVehicleData);
    
    return { 
      success: true, 
      vehicleUpdate: cleanVehicleData,
      message: `Boîtier ${deviceImei} associé avec succès au véhicule ${vehicleImmat}`
    };
    
  } catch (error) {
    console.error('Error associating device to vehicle:', error);
    throw error;
  }
};

/**
 * Dissociate device from vehicle - manages all 3 tables: Trame, Device, and Vehicle
 * @param {string} deviceImei - Device IMEI
 * @returns {Promise<Object>} Dissociation result
 */
export const dissociateDeviceFromVehicle = async (deviceImei) => {
  try {
    // Ensure Amplify is properly configured with retry
    await withCredentialRetry(async () => {
      await waitForAmplifyConfig();
      return true;
    });
    
    console.log(`🔄 Dissociating device ${deviceImei}`);
    
    // Step 1: Delete Trame entry (id = deviceImei)
    console.log(`📝 Step 1: Deleting Trame (id: ${deviceImei})`);
    const minimalDeleteTrame = /* GraphQL */ `
      mutation DeleteTrame($input: DeleteTrameInput!) {
        deleteTrame(input: $input) {
          id
          __typename
        }
      }
    `;
    
    try {
      await client.graphql({
        query: minimalDeleteTrame,
        variables: {
          input: {
            id: deviceImei
          }
        }
      });
      console.log(`✅ Trame deleted for ${deviceImei}`);
    } catch (trameError) {
      // If Trame doesn't exist, it's okay
      console.log(`ℹ️ No Trame to delete for ${deviceImei}`);
    }
    
    // Step 2: Update Device to remove vehicle association
    console.log(`📝 Step 2: Updating Device (imei: ${deviceImei}, removing immat)`);
    const minimalUpdateDevice = /* GraphQL */ `
      mutation UpdateDevice($input: UpdateDeviceInput!) {
        updateDevice(input: $input) {
          imei
          deviceVehicleImmat
          __typename
        }
      }
    `;
    
    await client.graphql({
      query: minimalUpdateDevice,
      variables: {
        input: {
          imei: deviceImei,
          deviceVehicleImmat: null
        }
      }
    });
    console.log(`✅ Device updated (dissociated) for ${deviceImei}`);
    
    // Step 3: Find and update vehicle(s) to remove device association
    console.log(`📝 Step 3: Finding and updating Vehicle(s)`);
    const minimalListVehicles = /* GraphQL */ `
      query ListVehiclesByImei($filter: ModelVehicleFilterInput, $limit: Int, $nextToken: String) {
        listVehicles(filter: $filter, limit: $limit, nextToken: $nextToken) {
          items {
            immat
            vehicleDeviceImei
          }
          nextToken
        }
      }
    `;

    // Boucle avec nextToken pour récupérer TOUS les véhicules associés
    let associatedVehicles = [];
    let nextToken = null;
    
    do {
      const vehiclesResponse = await client.graphql({
        query: minimalListVehicles,
        variables: {
          filter: {
            vehicleDeviceImei: { eq: deviceImei }
          },
          limit: 1000,
          nextToken: nextToken
        }
      });
      
      const items = vehiclesResponse.data?.listVehicles?.items || [];
      associatedVehicles = [...associatedVehicles, ...items];
      nextToken = vehiclesResponse.data?.listVehicles?.nextToken;
      
    } while (nextToken);
    
    // Dissociate from all vehicles (should be only one due to uniqueness)
    const minimalUpdateVehicle = /* GraphQL */ `
      mutation UpdateVehicle($input: UpdateVehicleInput!) {
        updateVehicle(input: $input) {
          immat
          vehicleDeviceImei
          updatedAt
          __typename
        }
      }
    `;

    const updatePromises = associatedVehicles.map(vehicle => {
      console.log(`📝 Updating vehicle ${vehicle.immat} to remove device`);
      return client.graphql({
        query: minimalUpdateVehicle,
        variables: {
          input: {
            immat: vehicle.immat,
            vehicleDeviceImei: null
          }
        }
      });
    });
    
    await Promise.all(updatePromises);
    console.log(`✅ ${associatedVehicles.length} vehicle(s) updated`);
    
    // Get device details to return complete dissociation info
    let deviceData = null;
    try {
      const minimalGetDevice = /* GraphQL */ `
        query GetDeviceSlim($imei: String!) {
          getDevice(imei: $imei) {
            imei
            sim
            protocolId
            deviceVehicleImmat
            __typename
          }
        }
      `;
      
      const deviceResponse = await client.graphql({
        query: minimalGetDevice,
        variables: { imei: deviceImei }
      });
      deviceData = deviceResponse.data?.getDevice;
    } catch (deviceError) {
      console.warn('Could not fetch device details after dissociation:', deviceError);
    }
    
    // Return dissociated device information for cache update
    const dissociatedDevice = {
      imei: deviceImei,
      isAssociated: false,
      vehicleImmat: null,
      type: 'device',
      // Include any other device fields available
      ...(deviceData && {
        sim: deviceData.sim,
        protocolId: deviceData.protocolId,
        typeBoitier: deviceData.protocolId?.toString() || ""
      })
    };
    
    console.log('✅ Dissociation completed successfully:', dissociatedDevice);
    
    return { 
      success: true, 
      message: `Boîtier ${deviceImei} dissocié avec succès`,
      dissociatedDevice: dissociatedDevice
    };
    
  } catch (error) {
    console.error('Error dissociating device:', error);
    throw error;
  }
};

/**
 * Get free devices (not associated with any vehicle)
 * @returns {Promise<Array>} Array of free devices
 */
export const getFreeDevices = async () => {
  try {
    // Ensure Amplify is properly configured with retry
    await withCredentialRetry(async () => {
      await waitForAmplifyConfig();
      return true;
    });
    const response = await client.graphql({
      query: queries.listDevices,
      variables: {
        limit: 1000
      }
    });
    
    const allDevices = response.data?.listDevices?.items || [];
    
    // Filter devices that don't have a vehicle association
    const freeDevices = allDevices.filter(device => !device.vehicle);
    
    return freeDevices;
  } catch (error) {
    throw error;
  }
};