import { getLazyClient } from '@/config/aws-config.js';
import * as queries from '../graphql/queries';

const client = getLazyClient();

/**
 * Service de diagnostic avancé pour les recherches IMEI
 */
export class ImeiDiagnosticService {
  
  /**
   * Test diagnostic complet pour un IMEI spécifique
   */
  static async runFullDiagnostic(imei) {
    console.log(`🔍 === DIAGNOSTIC COMPLET POUR IMEI ${imei} ===`);
    const results = {
      imei,
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    try {
      // Test 1: Recherche directe par getDevice
      console.log('🔍 Test 1: getDevice direct');
      try {
        const deviceResponse = await client.graphql({
          query: queries.getDevice,
          variables: { imei }
        });
        
        const test1 = {
          name: 'getDevice_direct',
          success: !!deviceResponse.data.getDevice,
          data: deviceResponse.data.getDevice,
          error: null
        };
        results.tests.push(test1);
        console.log('✅ getDevice result:', deviceResponse.data.getDevice);
      } catch (error) {
        results.tests.push({
          name: 'getDevice_direct',
          success: false,
          data: null,
          error: error.message
        });
        console.log('❌ getDevice error:', error.message);
      }

      // Test 2: listDevices avec filtre IMEI exact
      console.log('🔍 Test 2: listDevices avec filtre IMEI exact');
      try {
        const listResponse = await client.graphql({
          query: queries.listDevices,
          variables: {
            filter: {
              imei: { eq: imei }
            },
            limit: 10
          }
        });
        
        const test2 = {
          name: 'listDevices_filter_exact',
          success: listResponse.data.listDevices.items.length > 0,
          data: listResponse.data.listDevices.items,
          count: listResponse.data.listDevices.items.length,
          error: null
        };
        results.tests.push(test2);
        console.log('✅ listDevices filter result:', listResponse.data.listDevices.items);
      } catch (error) {
        results.tests.push({
          name: 'listDevices_filter_exact',
          success: false,
          data: null,
          error: error.message
        });
        console.log('❌ listDevices filter error:', error.message);
      }

      // Test 3: listDevices avec paramètre imei direct (nouvelle structure)
      console.log('🔍 Test 3: listDevices avec paramètre imei direct');
      try {
        const listImeiResponse = await client.graphql({
          query: queries.listDevices,
          variables: {
            imei: imei,
            limit: 10
          }
        });
        
        const test3 = {
          name: 'listDevices_param_imei',
          success: listImeiResponse.data.listDevices.items.length > 0,
          data: listImeiResponse.data.listDevices.items,
          count: listImeiResponse.data.listDevices.items.length,
          error: null
        };
        results.tests.push(test3);
        console.log('✅ listDevices param imei result:', listImeiResponse.data.listDevices.items);
      } catch (error) {
        results.tests.push({
          name: 'listDevices_param_imei',
          success: false,
          data: null,
          error: error.message
        });
        console.log('❌ listDevices param imei error:', error.message);
      }

      // Test 4: Recherche "brute force" - liste tous les devices et filtre côté client
      console.log('🔍 Test 4: Recherche brute force (tous les devices)');
      try {
        const allDevicesResponse = await client.graphql({
          query: queries.listDevices,
          variables: {
            limit: 1000
          }
        });
        
        const allDevices = allDevicesResponse.data.listDevices.items;
        const foundDevice = allDevices.find(device => device.imei === imei);
        
        const test4 = {
          name: 'brute_force_search',
          success: !!foundDevice,
          data: foundDevice,
          totalDevicesScanned: allDevices.length,
          error: null
        };
        results.tests.push(test4);
        console.log('✅ Brute force result:', foundDevice);
        console.log(`📊 Total devices scanned: ${allDevices.length}`);
      } catch (error) {
        results.tests.push({
          name: 'brute_force_search',
          success: false,
          data: null,
          error: error.message
        });
        console.log('❌ Brute force error:', error.message);
      }

      // Test 5: Vérifier le cache local
      console.log('🔍 Test 5: Vérification du cache local');
      try {
        const cacheKey = 'companyVehicleDeviceData';
        const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        
        let foundInCache = null;
        if (cachedData.vehicles && Array.isArray(cachedData.vehicles)) {
          foundInCache = cachedData.vehicles.find(item => 
            item.imei === imei || 
            (item.type === 'device' && item.imei === imei)
          );
        }
        
        const test5 = {
          name: 'local_cache_check',
          success: !!foundInCache,
          data: foundInCache,
          cacheSize: cachedData.vehicles ? cachedData.vehicles.length : 0,
          cacheAge: cachedData.timestamp ? Date.now() - cachedData.timestamp : null,
          error: null
        };
        results.tests.push(test5);
        console.log('✅ Cache check result:', foundInCache);
      } catch (error) {
        results.tests.push({
          name: 'local_cache_check',
          success: false,
          data: null,
          error: error.message
        });
        console.log('❌ Cache check error:', error.message);
      }

      // Résumé du diagnostic
      const successfulTests = results.tests.filter(test => test.success);
      console.log(`🔍 === RÉSUMÉ DIAGNOSTIC ${imei} ===`);
      console.log(`✅ Tests réussis: ${successfulTests.length}/${results.tests.length}`);
      console.log(`❌ Tests échoués: ${results.tests.length - successfulTests.length}/${results.tests.length}`);
      
      if (successfulTests.length > 0) {
        console.log('🎯 IMEI trouvé dans:', successfulTests.map(test => test.name).join(', '));
        console.log('📋 Données trouvées:', successfulTests[0].data);
      } else {
        console.log('❌ IMEI INTROUVABLE dans tous les tests');
      }

      return results;
      
    } catch (error) {
      console.error('🔍 Erreur lors du diagnostic:', error);
      throw error;
    }
  }

  /**
   * Force la synchronisation complète pour un IMEI
   */
  static async forceSyncImei(imei) {
    console.log(`🔄 === SYNCHRONISATION FORCÉE POUR IMEI ${imei} ===`);
    
    try {
      // Vider le cache local
      const cacheKey = 'companyVehicleDeviceData';
      localStorage.removeItem(cacheKey);
      console.log('🗑️ Cache local vidé');

      // Vider le cache global si présent
      if (window.allDataCache) {
        window.allDataCache = null;
        console.log('🗑️ Cache global vidé');
      }

      // Attendre un peu pour la propagation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refaire le diagnostic
      const diagnosticResults = await this.runFullDiagnostic(imei);
      
      console.log('🔄 Synchronisation forcée terminée');
      return diagnosticResults;
      
    } catch (error) {
      console.error('🔄 Erreur lors de la synchronisation forcée:', error);
      throw error;
    }
  }

  /**
   * Recherche améliorée avec tous les fallbacks
   */
  static async enhancedImeiSearch(imei) {
    console.log(`🔍 === RECHERCHE AMÉLIORÉE POUR IMEI ${imei} ===`);
    
    try {
      // Stratégie 1: getDevice direct
      try {
        const deviceResponse = await client.graphql({
          query: queries.getDevice,
          variables: { imei }
        });
        
        if (deviceResponse.data.getDevice) {
          console.log('✅ Trouvé via getDevice');
          return deviceResponse.data.getDevice;
        }
      } catch (error) {
        console.log('❌ getDevice échoué:', error.message);
      }

      // Stratégie 2: listDevices avec paramètre imei
      try {
        const listResponse = await client.graphql({
          query: queries.listDevices,
          variables: {
            imei: imei,
            limit: 20
          }
        });
        
        if (listResponse.data.listDevices.items.length > 0) {
          console.log('✅ Trouvé via listDevices (param imei)');
          return listResponse.data.listDevices.items[0];
        }
      } catch (error) {
        console.log('❌ listDevices (param) échoué:', error.message);
      }

      // Stratégie 3: listDevices avec filtre
      try {
        const filterResponse = await client.graphql({
          query: queries.listDevices,
          variables: {
            filter: { imei: { eq: imei } },
            limit: 20
          }
        });
        
        if (filterResponse.data.listDevices.items.length > 0) {
          console.log('✅ Trouvé via listDevices (filter)');
          return filterResponse.data.listDevices.items[0];
        }
      } catch (error) {
        console.log('❌ listDevices (filter) échoué:', error.message);
      }

      // Stratégie 4: Recherche brute force
      try {
        console.log('🔍 Tentative de recherche brute force...');
        const allResponse = await client.graphql({
          query: queries.listDevices,
          variables: {
            limit: 2000
          }
        });
        
        const foundDevice = allResponse.data.listDevices.items.find(device => device.imei === imei);
        if (foundDevice) {
          console.log('✅ Trouvé via recherche brute force');
          return foundDevice;
        }
      } catch (error) {
        console.log('❌ Recherche brute force échouée:', error.message);
      }

      console.log('❌ IMEI introuvable avec toutes les stratégies');
      return null;
      
    } catch (error) {
      console.error('🔍 Erreur lors de la recherche améliorée:', error);
      throw error;
    }
  }
}