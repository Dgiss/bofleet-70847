import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for managing data refresh after operations
 */
export const useDataRefresh = (loadAllData, setDevices, searchDevices, currentFilters) => {
  
  const refreshAfterAssociation = useCallback(async (message = "Association réussie", updatedItem = null) => {
    try {
      // Show success message
      toast({
        title: "Succès",
        description: message,
      });
      
      // Optimized refresh: update only modified item instead of reloading all data
      console.log('🔄 Optimized refresh after association...');
      console.log('🔄 Updated item received:', updatedItem);
      console.log('🔄 Current filters:', currentFilters);
      
      // FIXED: Update allDataCache as well to sync search functionality
      if (updatedItem && window.localStorage) {
        try {
          const cacheKey = 'companyVehicleDeviceData';
          const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '{}');
          
          if (cachedData.vehicles && Array.isArray(cachedData.vehicles)) {
            const vehicleIndex = cachedData.vehicles.findIndex(item => 
              (item.imei && item.imei === updatedItem.imei) || 
              (item.immat && item.immat === updatedItem.immat) ||
              (item.immatriculation && item.immatriculation === updatedItem.immat)
            );
            
            if (vehicleIndex !== -1) {
              console.log('🔄 Updating cache entry for item:', updatedItem);
              // Update the cached item
              cachedData.vehicles[vehicleIndex] = { ...cachedData.vehicles[vehicleIndex], ...updatedItem };
              
              // Save back to localStorage
              localStorage.setItem(cacheKey, JSON.stringify(cachedData));
              console.log('🔄 Cache updated successfully');
            }
          }
        } catch (cacheError) {
          console.warn('🔄 Cache update failed:', cacheError);
        }
      }
      
      if (updatedItem) {
        // Update only the specific item in local state
        console.log('🔄 Updating specific item in local state:', updatedItem);
        setDevices(prevDevices => {
          console.log('🔄 Previous devices count:', prevDevices.length);
          const updatedDevices = [...prevDevices];
          const index = updatedDevices.findIndex(item => 
            (item.imei && item.imei === updatedItem.imei) || 
            (item.immat && item.immat === updatedItem.immat) ||
            (item.immatriculation && item.immatriculation === updatedItem.immat)
          );
          console.log('🔄 Found item index to update:', index);
          
          if (index !== -1) {
            const currentItem = updatedDevices[index];
            console.log('🔄 Current item before update:', currentItem);
            
            // Check if we're in a "vehicles without IMEI" search and the vehicle now has an IMEI
            const wasVehicleWithoutImei = currentItem.type === 'vehicle' && (!currentItem.imei || currentItem.imei === '');
            const nowHasImei = updatedItem.vehicleDeviceImei || updatedItem.imei;
            
            if (wasVehicleWithoutImei && nowHasImei) {
              // Remove the vehicle from the list since it no longer matches "vehicles without IMEI"
              console.log('🔄 Removing vehicle from "vehicles without IMEI" list since it now has an IMEI');
              updatedDevices.splice(index, 1);
            } else {
              // Update the item normally
              updatedDevices[index] = { ...currentItem, ...updatedItem };
              console.log('🔄 Updated item in array:', updatedDevices[index]);
            }
          } else {
            console.log('🔄 Item not found in current list');
          }
          
          console.log('🔄 New devices count:', updatedDevices.length);
          return updatedDevices;
        });
        console.log('🔄 Local state updated successfully - avoiding full data reload');
      } else {
        // Fallback: refresh data based on current state (only when necessary)
        console.log('🔄 No updated item provided, doing full refresh...');
        if (currentFilters && Object.keys(currentFilters).length > 0) {
          console.log('🔄 Refreshing with current filters:', currentFilters);
          const refreshedResults = await searchDevices(currentFilters);
          setDevices(refreshedResults);
        } else {
          // Last resort: reload all data (avoid this when possible)
          console.log('🔄 Fallback: reloading all data...');
          await loadAllData();
        }
      }
      
      console.log('🔄 Optimized refresh completed successfully');
      
    } catch (error) {
      console.error('🔄 Error refreshing data:', error);
      toast({
        title: "Attention",
        description: "Association réussie, mais la liste pourrait ne pas être à jour. Veuillez actualiser manuellement.",
        variant: "destructive"
      });
    }
  }, [loadAllData, setDevices, searchDevices, currentFilters]);
  
  const refreshAfterDissociation = useCallback(async (message = "Dissociation réussie", updatedItem = null) => {
    // ENHANCED: Handle dissociation with force sync for critical cases
    try {
      toast({
        title: "Succès", 
        description: message,
      });
      
      console.log('🔄 Handling ENHANCED dissociation refresh...');
      console.log('🔄 Dissociated item:', updatedItem);
      
      // CRITICAL: For specific IMEIs, force complete cache invalidation
      const isProblematicImei = updatedItem?.imei === '350612071728933';
      
      if (isProblematicImei) {
        console.log('🎯 CRITICAL IMEI DETECTED - Forcing complete cache refresh');
        
        // Clear all caches immediately
        const cacheKey = 'companyVehicleDeviceData';
        localStorage.removeItem(cacheKey);
        if (window.allDataCache) {
          window.allDataCache = null;
        }
        
        // Force diagnostic sync
        try {
          const { ImeiDiagnosticService } = await import('../services/ImeiDiagnosticService.js');
          await ImeiDiagnosticService.forceSyncImei(updatedItem.imei);
          console.log('✅ Force sync completed for critical IMEI');
        } catch (syncError) {
          console.error('❌ Force sync failed:', syncError);
        }
        
        // Force complete data reload
        if (loadAllData) {
          console.log('🔄 Forcing complete data reload...');
          await loadAllData('complete');
        }
        
        return;
      }
      
      // STANDARD: Update cache to mark device as free/unassociated with better synchronization
      if (updatedItem && updatedItem.imei && window.localStorage) {
        try {
          const cacheKey = 'companyVehicleDeviceData';
          const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '{}');
          
          if (cachedData.vehicles && Array.isArray(cachedData.vehicles)) {
            console.log('🔄 Updating cache after dissociation for IMEI:', updatedItem.imei);
            
            // Find and update the device entry
            const deviceIndex = cachedData.vehicles.findIndex(item => 
              item.imei === updatedItem.imei && item.type === 'device'
            );
            
            if (deviceIndex !== -1) {
              console.log('🔄 Found device in cache, marking as free');
              cachedData.vehicles[deviceIndex] = {
                ...cachedData.vehicles[deviceIndex],
                isAssociated: false,
                vehicleImmat: null,
                deviceVehicleImmat: null,
                immatriculation: "",
                nomVehicule: "",
                entreprise: "Boîtier libre",
                // Preserve device-specific data from updatedItem
                sim: updatedItem.sim || cachedData.vehicles[deviceIndex].sim || "",
                typeBoitier: updatedItem.typeBoitier || cachedData.vehicles[deviceIndex].typeBoitier || "",
                protocolId: updatedItem.protocolId || cachedData.vehicles[deviceIndex].protocolId
              };
            } else {
              // Add the dissociated device as a free device if not found
              console.log('🔄 Adding dissociated device to cache as free device');
              const newDevice = {
                id: updatedItem.imei,
                type: 'device',
                imei: updatedItem.imei,
                isAssociated: false,
                vehicleImmat: null,
                immatriculation: "",
                nomVehicule: "",
                entreprise: "Boîtier libre",
                sim: updatedItem.sim || "",
                typeBoitier: updatedItem.typeBoitier || "",
                protocolId: updatedItem.protocolId || "",
                marque: "",
                modele: "",
                kilometrage: "",
                telephone: updatedItem.sim || "",
                emplacement: "",
                deviceData: updatedItem
              };
              cachedData.vehicles.push(newDevice);
            }
            
            // Also remove any vehicle associations in cache
            cachedData.vehicles.forEach(item => {
              if (item.type === 'vehicle' && item.vehicleDeviceImei === updatedItem.imei) {
                console.log('🔄 Removing device association from vehicle in cache');
                item.vehicleDeviceImei = null;
                item.imei = "";
              }
            });
            
            // Update cache timestamp to mark it as fresh
            localStorage.setItem(cacheKey + '_timestamp', Date.now().toString());
            localStorage.setItem(cacheKey, JSON.stringify(cachedData));
            console.log('🔄 Cache updated after dissociation with fresh timestamp');
            
            // Update the allDataCache reference if it exists
            if (window.allDataCache) {
              window.allDataCache = cachedData;
              console.log('🔄 Updated global allDataCache reference');
            }
          }
        } catch (cacheError) {
          console.warn('🔄 Cache update after dissociation failed:', cacheError);
        }
      }
      
      // Update local state
      if (updatedItem) {
        setDevices(prevDevices => {
          const updatedDevices = [...prevDevices];
          
          // Remove the device from "vehicles without IMEI" if it was there
          const vehicleIndex = updatedDevices.findIndex(item => 
            item.type === 'vehicle' && item.vehicleDeviceImei === updatedItem.imei
          );
          
          if (vehicleIndex !== -1) {
            console.log('🔄 Removing device from associated vehicle');
            updatedDevices[vehicleIndex] = {
              ...updatedDevices[vehicleIndex],
              vehicleDeviceImei: null,
              imei: ""
            };
          }
          
          return updatedDevices;
        });
      } else {
        // Fallback refresh
        return refreshAfterAssociation(message, updatedItem);
      }
      
    } catch (error) {
      console.error('🔄 Error in dissociation refresh:', error);
      toast({
        title: "Attention",
        description: "Dissociation réussie, mais la liste pourrait ne pas être à jour. Veuillez actualiser manuellement.",
        variant: "destructive"
      });
    }
  }, [refreshAfterAssociation, setDevices]);
  
  const refreshAfterDeletion = useCallback(async (message = "Suppression réussie") => {
    return refreshAfterAssociation(message);
  }, [refreshAfterAssociation]);
  
  return {
    refreshAfterAssociation,
    refreshAfterDissociation,
    refreshAfterDeletion
  };
};
