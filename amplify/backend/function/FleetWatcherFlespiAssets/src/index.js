/**
 * Lambda Handler pour la gestion des Assets Flespi
 *
 * Cette Lambda gère les opérations suivantes:
 * - sync_client_asset: Synchroniser un asset Client
 * - sync_vehicle_asset: Synchroniser un asset Véhicule
 * - sync_driver_asset: Synchroniser un asset Chauffeur
 * - create_device_interval: Créer un intervalle device <-> asset
 * - close_device_interval: Fermer un intervalle device <-> asset
 *
 * Usage via GraphQL:
 * mutation {
 *   manageFlespiAsset(
 *     action: "sync_vehicle_asset"
 *     input: {
 *       vehicleData: { immat: "AB-123-CD", ... }
 *     }
 *   ) {
 *     success
 *     message
 *     assetId
 *   }
 * }
 */

const {
  handleClientAsset,
  handleVehicleAsset,
  handleDriverAsset,
  createDeviceInterval,
  closeDeviceInterval
} = require('./asset-handlers');

/**
 * Handler principal de la Lambda
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  // Récupérer le token Flespi depuis les variables d'environnement
  const FLESPI_TOKEN = process.env.FLESPI_TOKEN;

  if (!FLESPI_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'FLESPI_TOKEN non configuré dans les variables d\'environnement'
      })
    };
  }

  try {
    // Parser les arguments de la mutation GraphQL
    const { action, input } = event.arguments;

    let result;

    switch (action) {
      case 'sync_client_asset':
        result = await syncClientAsset(input, FLESPI_TOKEN);
        break;

      case 'sync_vehicle_asset':
        result = await syncVehicleAsset(input, FLESPI_TOKEN);
        break;

      case 'sync_driver_asset':
        result = await syncDriverAsset(input, FLESPI_TOKEN);
        break;

      case 'create_device_interval':
        result = await createInterval(input, FLESPI_TOKEN);
        break;

      case 'close_device_interval':
        result = await closeInterval(input, FLESPI_TOKEN);
        break;

      default:
        return {
          success: false,
          message: `Action inconnue: ${action}`,
          assetId: null,
          intervalId: null
        };
    }

    return {
      success: true,
      message: result.message || 'Opération réussie',
      assetId: result.assetId || null,
      intervalId: result.intervalId || null,
      data: result.data || null
    };

  } catch (error) {
    console.error('Erreur lors du traitement:', error);

    return {
      success: false,
      message: error.message || 'Erreur lors du traitement de la requête',
      assetId: null,
      intervalId: null,
      error: JSON.stringify(error)
    };
  }
};

/**
 * Synchronise un asset Client
 */
async function syncClientAsset(input, flespiToken) {
  const { clientData } = input;

  if (!clientData || !clientData.id) {
    throw new Error('clientData.id est requis');
  }

  const result = await handleClientAsset(clientData, flespiToken);

  return {
    message: `Asset Client ${result.action === 'created' ? 'créé' : 'mis à jour'} avec succès`,
    assetId: result.assetId,
    data: result
  };
}

/**
 * Synchronise un asset Véhicule
 */
async function syncVehicleAsset(input, flespiToken) {
  const { vehicleData, createInterval: shouldCreateInterval } = input;

  if (!vehicleData || !vehicleData.immat) {
    throw new Error('vehicleData.immat est requis');
  }

  const result = await handleVehicleAsset(vehicleData, flespiToken);

  // Si demandé et qu'un device est associé, créer l'intervalle automatiquement
  if (shouldCreateInterval && vehicleData.vehicleDeviceImei && result.assetId) {
    try {
      const intervalResult = await createDeviceInterval(
        result.assetId,
        vehicleData.vehicleDeviceImei,
        flespiToken,
        {
          meta: {
            vehicle_immat: vehicleData.immat,
            company_id: vehicleData.companyVehiclesId
          }
        }
      );

      return {
        message: `Asset Véhicule ${result.action === 'created' ? 'créé' : 'mis à jour'} avec intervalle device`,
        assetId: result.assetId,
        intervalId: intervalResult.intervalId,
        data: { asset: result, interval: intervalResult }
      };
    } catch (intervalError) {
      console.error('Erreur lors de la création de l\'intervalle:', intervalError);
      // On retourne quand même le succès de la création de l'asset
    }
  }

  return {
    message: `Asset Véhicule ${result.action === 'created' ? 'créé' : 'mis à jour'} avec succès`,
    assetId: result.assetId,
    data: result
  };
}

/**
 * Synchronise un asset Chauffeur
 */
async function syncDriverAsset(input, flespiToken) {
  const { driverData } = input;

  if (!driverData || !driverData.sub) {
    throw new Error('driverData.sub est requis');
  }

  const result = await handleDriverAsset(driverData, flespiToken);

  return {
    message: `Asset Chauffeur ${result.action === 'created' ? 'créé' : 'mis à jour'} avec succès`,
    assetId: result.assetId,
    data: result
  };
}

/**
 * Crée un intervalle device <-> asset
 */
async function createInterval(input, flespiToken) {
  const { assetId, deviceImei, begin, end, meta } = input;

  if (!assetId || !deviceImei) {
    throw new Error('assetId et deviceImei sont requis');
  }

  const result = await createDeviceInterval(
    assetId,
    deviceImei,
    flespiToken,
    { begin, end, meta }
  );

  return {
    message: result.action === 'created'
      ? 'Intervalle créé avec succès'
      : 'Intervalle déjà existant',
    intervalId: result.intervalId,
    data: result
  };
}

/**
 * Ferme un intervalle device <-> asset
 */
async function closeInterval(input, flespiToken) {
  const { assetId, intervalId, endTimestamp } = input;

  if (!assetId) {
    throw new Error('assetId est requis');
  }

  const result = await closeDeviceInterval(
    assetId,
    intervalId,
    flespiToken,
    endTimestamp
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return {
    message: 'Intervalle fermé avec succès',
    intervalId: result.intervalId,
    data: result
  };
}
