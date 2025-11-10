/**
 * Handlers pour la gestion des Assets Flespi
 * Gère les assets de type Client, Véhicule et Chauffeur
 */

const FlespiClient = require('./flespi-client');

/**
 * Types d'assets supportés
 */
const ASSET_TYPES = {
  CLIENT: 'client',
  VEHICLE: 'vehicle',
  DRIVER: 'driver'
};

/**
 * Crée ou met à jour un asset Client sur Flespi
 * @param {object} clientData - Données du client depuis DynamoDB
 * @param {string} flespiToken - Token d'authentification Flespi
 * @returns {Promise<object>} - Asset créé/mis à jour
 */
async function handleClientAsset(clientData, flespiToken) {
  const client = new FlespiClient(flespiToken);

  const assetData = {
    name: `Client: ${clientData.name || clientData.id}`,
    meta: {
      type: ASSET_TYPES.CLIENT,
      client_id: clientData.id,
      siret: clientData.siret || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      mobile: clientData.mobile || '',
      address: clientData.address || '',
      postal_code: clientData.postalCode || '',
      city: clientData.city || '',
      country_code: clientData.countryCode || '',
      subscription_date: clientData.subscriptionDate || '',
      last_update: new Date().toISOString()
    }
  };

  // Vérifier si l'asset existe déjà (via meta client_id)
  let existingAssetId = clientData.flespiAssetId;

  if (existingAssetId) {
    try {
      // Tenter de mettre à jour l'asset existant
      const result = await client.updateAsset(existingAssetId, assetData);
      return {
        success: true,
        action: 'updated',
        assetId: existingAssetId,
        result: result
      };
    } catch (error) {
      // Si l'asset n'existe plus, on le recrée
      console.log(`Asset ${existingAssetId} introuvable, création d'un nouvel asset`);
      existingAssetId = null;
    }
  }

  // Créer un nouvel asset
  const result = await client.createAsset(assetData);
  const newAssetId = result.result && result.result[0] ? result.result[0].id : null;

  return {
    success: true,
    action: 'created',
    assetId: newAssetId,
    result: result
  };
}

/**
 * Crée ou met à jour un asset Véhicule sur Flespi
 * @param {object} vehicleData - Données du véhicule depuis DynamoDB
 * @param {string} flespiToken - Token d'authentification Flespi
 * @returns {Promise<object>} - Asset créé/mis à jour
 */
async function handleVehicleAsset(vehicleData, flespiToken) {
  const client = new FlespiClient(flespiToken);

  const assetData = {
    name: `Véhicule: ${vehicleData.immat || vehicleData.nomVehicule || 'N/A'}`,
    meta: {
      type: ASSET_TYPES.VEHICLE,
      immatriculation: vehicleData.immat,
      nom_vehicule: vehicleData.nomVehicule || '',
      vin: vehicleData.VIN || '',
      marque: vehicleData.marque || '',
      modele: vehicleData.AWN_model || '',
      year: vehicleData.year || '',
      fuel_type: vehicleData.fuelType || vehicleData.energie || '',
      puissance_fiscale: vehicleData.puissanceFiscale || '',
      puissance_din: vehicleData.puissanceDin || '',
      kilometerage: vehicleData.kilometerage || '',
      company_id: vehicleData.companyVehiclesId || '',
      device_imei: vehicleData.vehicleDeviceImei || '',
      last_update: new Date().toISOString()
    }
  };

  // Vérifier si l'asset existe déjà
  let existingAssetId = vehicleData.flespiAssetId;

  if (existingAssetId) {
    try {
      const result = await client.updateAsset(existingAssetId, assetData);
      return {
        success: true,
        action: 'updated',
        assetId: existingAssetId,
        result: result
      };
    } catch (error) {
      console.log(`Asset ${existingAssetId} introuvable, création d'un nouvel asset`);
      existingAssetId = null;
    }
  }

  // Créer un nouvel asset
  const result = await client.createAsset(assetData);
  const newAssetId = result.result && result.result[0] ? result.result[0].id : null;

  return {
    success: true,
    action: 'created',
    assetId: newAssetId,
    result: result
  };
}

/**
 * Crée ou met à jour un asset Chauffeur sur Flespi
 * @param {object} driverData - Données du chauffeur depuis DynamoDB
 * @param {string} flespiToken - Token d'authentification Flespi
 * @returns {Promise<object>} - Asset créé/mis à jour
 */
async function handleDriverAsset(driverData, flespiToken) {
  const client = new FlespiClient(flespiToken);

  const fullname = driverData.fullname || `${driverData.firstname || ''} ${driverData.lastname || ''}`.trim();

  const assetData = {
    name: `Chauffeur: ${fullname || driverData.sub}`,
    meta: {
      type: ASSET_TYPES.DRIVER,
      driver_sub: driverData.sub,
      firstname: driverData.firstname || '',
      lastname: driverData.lastname || '',
      fullname: fullname,
      email: driverData.email || '',
      mobile: driverData.mobile || '',
      driving_license_number: driverData.drivingLicenseNumber || '',
      driving_license_type: driverData.drivingLicenseType || '',
      job: driverData.job || '',
      hiring_date: driverData.hiringDate || '',
      driver_key: driverData.driverKey || '',
      company_id: driverData.companyDriversId || '',
      last_update: new Date().toISOString()
    }
  };

  // Vérifier si l'asset existe déjà
  let existingAssetId = driverData.flespiAssetId;

  if (existingAssetId) {
    try {
      const result = await client.updateAsset(existingAssetId, assetData);
      return {
        success: true,
        action: 'updated',
        assetId: existingAssetId,
        result: result
      };
    } catch (error) {
      console.log(`Asset ${existingAssetId} introuvable, création d'un nouvel asset`);
      existingAssetId = null;
    }
  }

  // Créer un nouvel asset
  const result = await client.createAsset(assetData);
  const newAssetId = result.result && result.result[0] ? result.result[0].id : null;

  return {
    success: true,
    action: 'created',
    assetId: newAssetId,
    result: result
  };
}

/**
 * Crée un intervalle d'association device <-> asset
 * @param {number} assetId - ID de l'asset Flespi
 * @param {string} deviceImei - IMEI du device
 * @param {string} flespiToken - Token d'authentification Flespi
 * @param {object} options - Options supplémentaires (begin, end, meta)
 * @returns {Promise<object>} - Intervalle créé
 */
async function createDeviceInterval(assetId, deviceImei, flespiToken, options = {}) {
  const client = new FlespiClient(flespiToken);

  // Vérifier s'il existe déjà un intervalle actif pour ce device
  const activeInterval = await client.getActiveInterval(assetId);

  if (activeInterval && activeInterval.device_id === parseInt(deviceImei)) {
    console.log(`Intervalle actif déjà existant pour device ${deviceImei} sur asset ${assetId}`);
    return {
      success: true,
      action: 'already_exists',
      intervalId: activeInterval.id,
      interval: activeInterval
    };
  }

  // Si un intervalle actif existe avec un autre device, le fermer
  if (activeInterval) {
    console.log(`Fermeture de l'intervalle actif ${activeInterval.id} avant d'en créer un nouveau`);
    await client.closeInterval(assetId, activeInterval.id);
  }

  // Créer le nouvel intervalle
  const intervalData = {
    device_id: parseInt(deviceImei),
    begin: options.begin || Math.floor(Date.now() / 1000),
    end: options.end || 0,
    meta: options.meta || {}
  };

  const result = await client.createInterval(assetId, intervalData);
  const newIntervalId = result.result && result.result[0] ? result.result[0].id : null;

  return {
    success: true,
    action: 'created',
    intervalId: newIntervalId,
    result: result
  };
}

/**
 * Ferme un intervalle d'association device <-> asset
 * @param {number} assetId - ID de l'asset Flespi
 * @param {number} intervalId - ID de l'intervalle (optionnel, ferme l'actif si non fourni)
 * @param {string} flespiToken - Token d'authentification Flespi
 * @param {number} endTimestamp - Timestamp de fin (optionnel)
 * @returns {Promise<object>} - Intervalle fermé
 */
async function closeDeviceInterval(assetId, intervalId, flespiToken, endTimestamp = null) {
  const client = new FlespiClient(flespiToken);

  // Si aucun intervalId fourni, fermer l'intervalle actif
  if (!intervalId) {
    const activeInterval = await client.getActiveInterval(assetId);
    if (!activeInterval) {
      return {
        success: false,
        message: 'Aucun intervalle actif à fermer'
      };
    }
    intervalId = activeInterval.id;
  }

  const result = await client.closeInterval(assetId, intervalId, endTimestamp);

  return {
    success: true,
    action: 'closed',
    intervalId: intervalId,
    result: result
  };
}

module.exports = {
  ASSET_TYPES,
  handleClientAsset,
  handleVehicleAsset,
  handleDriverAsset,
  createDeviceInterval,
  closeDeviceInterval
};
