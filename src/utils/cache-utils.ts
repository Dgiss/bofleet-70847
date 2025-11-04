/**
 * Utility functions for managing localStorage cache efficiently
 * Helps prevent QuotaExceededError and optimize cache usage
 */

const CACHE_PREFIX = 'fleetwatch_';
const MAX_CACHE_SIZE_MB = 2; // Maximum cache size in MB

export interface CacheEntry {
  data: any;
  timestamp: number;
  size?: number;
}

/**
 * Safely set item in localStorage with size checking
 * @param key - Cache key
 * @param data - Data to cache
 * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns boolean - Success status
 */
export const safeSetCache = (key: string, data: any, maxAgeMs: number = 300000): boolean => {
  try {
    const cacheEntry: CacheEntry = {
      data,
      timestamp: Date.now(),
      size: 0
    };
    
    const cacheString = JSON.stringify(cacheEntry);
    const sizeMB = cacheString.length / 1024 / 1024;
    
    console.log(`Cache "${key}" size: ${sizeMB.toFixed(2)}MB`);
    
    // Check if cache size is within limits
    if (sizeMB > MAX_CACHE_SIZE_MB) {
      console.warn(`⚠️ Cache "${key}" too large (${sizeMB.toFixed(2)}MB), skipping save`);
      return false;
    }
    
    // Update size in entry
    cacheEntry.size = cacheString.length;
    
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheEntry));
    console.log(`✅ Cache "${key}" saved successfully (${sizeMB.toFixed(2)}MB)`);
    return true;
    
  } catch (error) {
    console.warn(`Error saving cache "${key}":`, error);
    
    // If QuotaExceededError, try to clear old caches
    if (error.name === 'QuotaExceededError') {
      console.log('Quota exceeded, attempting to clear old caches...');
      clearOldCaches();
      return false;
    }
    
    return false;
  }
};

/**
 * Safely get item from localStorage with age checking
 * @param key - Cache key
 * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns Cached data or null if expired/not found
 */
export const safeGetCache = (key: string, maxAgeMs: number = 300000): any => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    
    const cacheEntry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - cacheEntry.timestamp;
    
    if (age > maxAgeMs) {
      console.log(`Cache "${key}" expired (age: ${Math.round(age / 1000)}s), removing`);
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    console.log(`Using cached "${key}" (age: ${Math.round(age / 1000)}s)`);
    return cacheEntry.data;
    
  } catch (error) {
    console.warn(`Error reading cache "${key}":`, error);
    localStorage.removeItem(CACHE_PREFIX + key);
    return null;
  }
};

/**
 * Clear all old cache entries
 */
export const clearOldCaches = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cleared ${keysToRemove.length} old cache entries`);
    
  } catch (error) {
    console.warn('Error clearing old caches:', error);
  }
};

/**
 * Get total cache size across all FleetWatch caches
 * @returns Size in MB
 */
export const getTotalCacheSize = (): number => {
  try {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
    }
    
    return totalSize / 1024 / 1024; // Convert to MB
    
  } catch (error) {
    console.warn('Error calculating cache size:', error);
    return 0;
  }
};

/**
 * Remove specific cache entry
 * @param key - Cache key to remove
 */
export const removeCache = (key: string): void => {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
    console.log(`Cache "${key}" removed`);
  } catch (error) {
    console.warn(`Error removing cache "${key}":`, error);
  }
};