/**
 * Service pour l'API Auto Ways Network (SIV)
 * Documentation: https://app.auto-ways.net/api/
 */

const AWN_API_BASE = 'https://app.auto-ways.net/api';
const AWN_TOKEN = '2cc614726936bc2fc2533b8f47f42c06';

export interface AWNVehicleInfo {
  // Identifiants
  vin?: string;
  immatriculation?: string;
  
  // Informations commerciales
  marque?: string;
  modele?: string;
  nom_commercial?: string;
  k_type?: string;
  
  // Caractéristiques techniques
  energie?: string;
  energie_code?: string;
  puissance_fiscale?: number;
  puissance_cv?: number;
  cylindree?: string;
  
  // Dates
  date_mise_circulation?: string;
  
  // Autres
  couleur?: string;
  carrosserie?: string;
  genre?: string;
  
  // Réponse brute de l'API
  raw?: any;
}

export interface AWNApiResponse {
  success: boolean;
  data?: AWNVehicleInfo;
  error?: string;
  credits_remaining?: number;
}

/**
 * Récupère les informations d'un véhicule par sa plaque d'immatriculation
 * via l'API Auto Ways Network (SIV France)
 */
export const fetchVehicleInfoByPlate = async (immatriculation: string): Promise<AWNApiResponse> => {
  try {
    // Nettoyer l'immatriculation (enlever espaces et tirets)
    const cleanedImmat = immatriculation.replace(/[\s-]/g, '').toUpperCase();
    
    if (!cleanedImmat) {
      return { success: false, error: 'Immatriculation vide' };
    }

    const url = `${AWN_API_BASE}/v1/fr?immat=${encodeURIComponent(cleanedImmat)}&token=${AWN_TOKEN}`;
    
    console.log(`🔍 AWN API: Recherche véhicule ${cleanedImmat}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ AWN API Error ${response.status}:`, errorText);
      
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'Token invalide ou expiré' };
      }
      if (response.status === 404) {
        return { success: false, error: 'Véhicule non trouvé dans la base SIV' };
      }
      if (response.status === 429) {
        return { success: false, error: 'Limite de requêtes atteinte' };
      }
      
      return { success: false, error: `Erreur API: ${response.status}` };
    }

    const data = await response.json();
    
    // Vérifier si l'API retourne une erreur
    if (data.error || data.erreur) {
      return { 
        success: false, 
        error: data.error || data.erreur || 'Véhicule non trouvé' 
      };
    }

    // Mapper les champs de l'API vers notre structure
    const vehicleInfo: AWNVehicleInfo = {
      vin: data.vin || data.VIN,
      immatriculation: cleanedImmat,
      marque: data.marque,
      modele: data.modele,
      nom_commercial: data.nom_commercial || data.nomCommercial,
      k_type: data.k_type || data.kType,
      energie: data.energie || data.carburant,
      energie_code: data.energie_code || data.energieCode,
      puissance_fiscale: data.puissance_fiscale || data.puissanceFiscale || data.cv_fiscaux,
      puissance_cv: data.puissance_cv || data.puissanceCv || data.chevaux,
      cylindree: data.cylindree,
      date_mise_circulation: data.date_mise_circulation || data.dateMiseCirculation || data.date1erCir,
      couleur: data.couleur,
      carrosserie: data.carrosserie,
      genre: data.genre,
      raw: data,
    };

    console.log(`✅ AWN API: Véhicule trouvé - ${vehicleInfo.marque} ${vehicleInfo.nom_commercial || vehicleInfo.modele}`);
    
    return {
      success: true,
      data: vehicleInfo,
      credits_remaining: data.credits_remaining || data.creditsRestants,
    };
    
  } catch (error) {
    console.error('❌ AWN API Exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur de connexion à l\'API' 
    };
  }
};

/**
 * Mappe les données AWN vers les champs du schéma Vehicle (AWN_*)
 */
export const mapAWNToVehicleFields = (awnData: AWNVehicleInfo): Record<string, any> => {
  return {
    AWN_VIN: awnData.vin || null,
    AWN_nom_commercial: awnData.nom_commercial || null,
    AWN_marque: awnData.marque || null,
    AWN_model: awnData.modele || null,
    AWN_k_type: awnData.k_type || null,
    AWN_energie_code: awnData.energie_code || awnData.energie || null,
    // Champs supplémentaires si disponibles dans le schéma
    puissanceFiscale: awnData.puissance_fiscale || null,
    dateMiseEnCirculation: awnData.date_mise_circulation || null,
    couleur: awnData.couleur || null,
  };
};

/**
 * Vérifie les crédits disponibles sur le compte AWN
 */
export const checkAWNCredits = async (): Promise<{ success: boolean; credits?: number; error?: string }> => {
  try {
    const url = `${AWN_API_BASE}/my-account/credits?token=${AWN_TOKEN}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, error: `Erreur API: ${response.status}` };
    }

    const data = await response.json();
    
    return {
      success: true,
      credits: data.credits || data.creditsRestants || 0,
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur de connexion' 
    };
  }
};
