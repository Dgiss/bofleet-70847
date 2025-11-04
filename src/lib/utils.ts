import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans an object by removing non-serializable properties (URL objects, functions, etc.)
 * and keeping only primitive values (string, number, boolean) for GraphQL operations
 */
export function cleanDataForGraphQL(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (data instanceof URL || data instanceof File || data instanceof Blob) {
    return undefined; // Remove non-serializable objects
  }

  if (Array.isArray(data)) {
    return data.map(item => cleanDataForGraphQL(item)).filter(item => item !== undefined);
  }

  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip non-serializable properties
      if (key === 'picture' || key === 'logo' || key === '__typename') {
        continue;
      }
      
      const cleanedValue = cleanDataForGraphQL(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }

  return undefined; // Remove functions and other non-serializable types
}
