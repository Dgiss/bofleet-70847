// ============================================================================
// SERVICE ADAPTÉ POUR INTÉGRATION AVEC L'ARCHITECTURE EXISTANTE
// ============================================================================

import { VehicleService } from './VehicleService.js';
import { DeviceService } from './DeviceService.js';
import { associateDeviceToVehicle } from './DeviceAssociationService.js';
import { toast } from '@/hooks/use-toast';

// ============================================================================
// FONCTION LISTER VÉHICULES ADAPTÉE
// ============================================================================

/**
 * Adapte la fonction fetchVehicules pour utiliser le cache unifié
 * @param {Object} hookData - Données du hook useCompanyVehicleDevice
 * @param {Object} filters - Filtres à appliquer
 * @param {number} pageSize - Taille de page pour pagination client
 * @param {number} page - Page courante (0-indexée)
 * @returns {Object} Données paginées côté client
 */
export const fetchVehiclesPaginated = async (hookData, filters = {}, pageSize = 25, page = 0) => {
  const { allDataCache, loadAllData, isCacheReady } = hookData;
  
  // Si le cache n'est pas prêt, charger les données
  if (!isCacheReady || !allDataCache) {
    console.log('Cache not ready, loading data...');
    await loadAllData();
    return { items: [], totalRecords: 0, hasNextPage: false };
  }

  // Filtrer les véhicules depuis le cache
  let filteredVehicles = allDataCache.filter(item => item.type === "vehicle");
  
  // Appliquer les filtres
  if (filters.companyId) {
    filteredVehicles = filteredVehicles.filter(v => v.companyVehiclesId === filters.companyId);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredVehicles = filteredVehicles.filter(v => 
      v.immatriculation?.toLowerCase().includes(searchLower) ||
      v.nomVehicule?.toLowerCase().includes(searchLower) ||
      v.entreprise?.toLowerCase().includes(searchLower)
    );
  }

  // Pagination côté client
  const start = page * pageSize;
  const end = start + pageSize;
  const items = filteredVehicles.slice(start, end);
  const totalRecords = filteredVehicles.length;
  const hasNextPage = end < totalRecords;

  console.log(`Paginated vehicles: page ${page + 1}, showing ${items.length} of ${totalRecords} total`);

  return {
    items,
    totalRecords,
    hasNextPage,
    currentPage: page
  };
};

// ============================================================================
// FONCTION LISTER DEVICES ADAPTÉE
// ============================================================================

/**
 * Adapte la fonction fetchDevices pour utiliser le cache unifié
 * @param {Object} hookData - Données du hook useCompanyVehicleDevice
 * @param {Object} filters - Filtres à appliquer
 * @param {number} pageSize - Taille de page pour pagination client
 * @param {number} page - Page courante (0-indexée)
 * @returns {Object} Données paginées côté client
 */
export const fetchDevicesPaginated = async (hookData, filters = {}, pageSize = 25, page = 0) => {
  const { allDataCache, loadAllData, isCacheReady } = hookData;
  
  // Si le cache n'est pas prêt, charger les données
  if (!isCacheReady || !allDataCache) {
    console.log('Cache not ready, loading data...');
    await loadAllData();
    return { items: [], totalRecords: 0, hasNextPage: false };
  }

  // Filtrer tous les devices (associés et libres) depuis le cache
  let filteredDevices = allDataCache.filter(item => 
    item.type === "device" || (item.type === "vehicle" && item.imei)
  );
  
  // Appliquer les filtres
  if (filters.companyId) {
    filteredDevices = filteredDevices.filter(d => 
      d.companyVehiclesId === filters.companyId || d.entreprise === "Boîtier libre"
    );
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredDevices = filteredDevices.filter(d => 
      d.imei?.toLowerCase().includes(searchLower) ||
      d.telephone?.toLowerCase().includes(searchLower)
    );
  }

  // Pagination côté client
  const start = page * pageSize;
  const end = start + pageSize;
  const items = filteredDevices.slice(start, end);
  const totalRecords = filteredDevices.length;
  const hasNextPage = end < totalRecords;

  console.log(`Paginated devices: page ${page + 1}, showing ${items.length} of ${totalRecords} total`);

  return {
    items,
    totalRecords,
    hasNextPage,
    currentPage: page
  };
};

// ============================================================================
// FONCTION CRÉER VÉHICULE ADAPTÉE
// ============================================================================

/**
 * Adapte la fonction createVehicle pour utiliser VehicleService existant
 * @param {Object} data - Données du véhicule
 * @param {Object} hookData - Données du hook useCompanyVehicleDevice
 * @returns {Promise<Object>} Résultat de création
 */
export const createVehicleAdapted = async (data, hookData) => {
  const { loadAllData } = hookData;
  
  try {
    console.log('Creating vehicle with adapted service:', data);
    
    // Adapter les données au format attendu par VehicleService
    const vehicleData = {
      immatriculation: data.immatriculation || data.immat,
      companyVehiclesId: data.company?.id || data.companyVehiclesId,
      code: data.code,
      nomVehicule: data.nomVehicule,
      marque: data.brand?.brandName || data.marque,
      modele: data.modele?.modele || data.modele,
      emplacement: data.emplacement || data.locations,
      // Autres champs optionnels
      energie: data.energie,
      couleur: data.couleur,
      dateMiseEnCirculation: data.dateMiseEnCirculation,
      VIN: data.VIN,
      AWN_nom_commercial: data.AWN_nom_commercial,
      puissanceFiscale: data.puissanceFiscale
    };

    // Utiliser le service existant
    const result = await VehicleService.createVehicleData(vehicleData);
    
    // Recharger le cache après création
    await loadAllData();
    
    // Afficher toast de succès
    toast({
      title: "Succès",
      description: "Véhicule créé avec succès",
    });
    
    console.log('Vehicle created successfully:', result);
    return result;
    
  } catch (error) {
    console.error('Error creating vehicle:', error);
    
    // Afficher toast d'erreur
    toast({
      title: "Erreur",
      description: `Erreur lors de la création du véhicule: ${error.message}`,
      variant: "destructive",
    });
    
    throw error;
  }
};

// ============================================================================
// FONCTION CRÉER DEVICE ADAPTÉE
// ============================================================================

/**
 * Adapte la fonction createdevices pour utiliser DeviceService existant
 * @param {Object} data - Données du device
 * @param {Object} hookData - Données du hook useCompanyVehicleDevice
 * @returns {Promise<Object>} Résultat de création
 */
export const createDeviceAdapted = async (data, hookData) => {
  const { loadAllData } = hookData;
  
  try {
    console.log('Creating device with adapted service:', data);
    
    // Adapter les données au format attendu par DeviceService
    const deviceData = {
      imei: data.imei,
      // Autres champs selon le schéma GraphQL
      protocolId: data.protocolId,
      sim: data.sim,
      name: data.name
    };

    // Utiliser le service existant
    const result = await DeviceService.createDevice(deviceData);
    
    // Recharger le cache après création
    await loadAllData();
    
    // Afficher toast de succès
    toast({
      title: "Succès",
      description: "Device créé avec succès",
    });
    
    console.log('Device created successfully:', result);
    return result;
    
  } catch (error) {
    console.error('Error creating device:', error);
    
    // Afficher toast d'erreur
    toast({
      title: "Erreur",
      description: `Erreur lors de la création du device: ${error.message}`,
      variant: "destructive",
    });
    
    throw error;
  }
};

// ============================================================================
// FONCTION ASSOCIER VÉHICULE-DEVICE ADAPTÉE
// ============================================================================

/**
 * Adapte la fonction onSubmit pour utiliser DeviceAssociationService
 * @param {string} deviceImei - IMEI du device
 * @param {string} vehicleImmat - Immatriculation du véhicule
 * @param {Object} hookData - Données du hook useCompanyVehicleDevice
 * @returns {Promise<Object>} Résultat de l'association
 */
export const associateVehicleDeviceAdapted = async (deviceImei, vehicleImmat, hookData) => {
  const { loadAllData } = hookData;
  
  try {
    console.log('Associating device to vehicle with adapted service:', { deviceImei, vehicleImmat });
    
    // Utiliser le service d'association existant (corrigé)
    const result = await associateDeviceToVehicle(deviceImei, vehicleImmat);
    
    // Recharger le cache après association
    await loadAllData();
    
    // Afficher toast de succès
    toast({
      title: "Succès",
      description: "Véhicule et device associés avec succès",
    });
    
    console.log('Association successful:', result);
    return result;
    
  } catch (error) {
    console.error('Error associating vehicle and device:', error);
    
    // Afficher toast d'erreur
    toast({
      title: "Erreur",
      description: `Erreur lors de l'association: ${error.message}`,
      variant: "destructive",
    });
    
    throw error;
  }
};

// ============================================================================
// FONCTIONS UTILITAIRES POUR FILTRAGE AVANCÉ
// ============================================================================

/**
 * Recherche avancée dans les véhicules et devices
 * @param {Object} hookData - Données du hook useCompanyVehicleDevice
 * @param {Object} searchCriteria - Critères de recherche
 * @returns {Array} Résultats filtrés
 */
export const advancedSearch = async (hookData, searchCriteria) => {
  const { allDataCache, loadAllData, isCacheReady } = hookData;
  
  if (!isCacheReady || !allDataCache) {
    await loadAllData();
    return [];
  }

  let results = [...allDataCache];

  // Filtrer par type
  if (searchCriteria.type) {
    results = results.filter(item => item.type === searchCriteria.type);
  }

  // Filtrer par entreprise
  if (searchCriteria.company) {
    results = results.filter(item => 
      item.entreprise?.toLowerCase().includes(searchCriteria.company.toLowerCase())
    );
  }

  // Filtrer par IMEI
  if (searchCriteria.imei) {
    results = results.filter(item => 
      item.imei?.toLowerCase().includes(searchCriteria.imei.toLowerCase())
    );
  }

  // Filtrer par immatriculation
  if (searchCriteria.immatriculation) {
    results = results.filter(item => 
      item.immatriculation?.toLowerCase().includes(searchCriteria.immatriculation.toLowerCase())
    );
  }

  // Filtrer par statut d'association
  if (searchCriteria.associationStatus !== undefined) {
    results = results.filter(item => item.isAssociated === searchCriteria.associationStatus);
  }

  return results;
};

/**
 * Obtenir les statistiques des véhicules et devices
 * @param {Object} hookData - Données du hook useCompanyVehicleDevice
 * @returns {Object} Statistiques
 */
export const getVehicleDeviceStats = async (hookData) => {
  const { allDataCache, loadAllData, isCacheReady } = hookData;
  
  if (!isCacheReady || !allDataCache) {
    await loadAllData();
    return {};
  }

  const vehicles = allDataCache.filter(item => item.type === "vehicle");
  const devices = allDataCache.filter(item => item.type === "device");
  const associatedVehicles = vehicles.filter(v => v.isAssociated);
  const unassociatedDevices = devices.filter(d => !d.isAssociated);

  return {
    totalVehicles: vehicles.length,
    totalDevices: devices.length,
    associatedVehicles: associatedVehicles.length,
    unassociatedVehicles: vehicles.length - associatedVehicles.length,
    freeDevices: unassociatedDevices.length,
    associationRate: vehicles.length > 0 ? (associatedVehicles.length / vehicles.length * 100).toFixed(1) : 0
  };
};