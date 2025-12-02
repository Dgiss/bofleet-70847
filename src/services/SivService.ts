/**
 * Service pour l'API SIV (Auto Ways Network)
 * Documentation: https://app.auto-ways.net/api/
 */

const SIV_API_BASE_URL = "https://app.auto-ways.net/api";
const SIV_API_TOKEN = "2cc614726936bc2fc2533b8f47f42c06";

export interface SivVehicleData {
  // Champs AWN_*
  AWN_VIN?: string;
  AWN_genre?: string;
  AWN_nom_commercial?: string;
  AWN_numero_de_serie?: string;
  AWN_model?: string;
  AWN_model_image?: string;
  AWN_url_image?: string;
  AWN_energie_code?: string;
  AWN_puissance_KW?: string;
  AWN_max_speed?: string;
  AWN_nbr_places?: string;
  AWN_nbr_portes?: string;
  AWN_nbr_vitesses?: string;
  AWN_nbr_cylindres?: string;
  AWN_poids_vide?: string;
  AWN_poids_total?: string;
  AWN_poids_max_autorise?: string;
  AWN_consommation_urbaine?: string;
  AWN_consommation_ex_urbaine?: string;
  AWN_consommation_mixte?: string;
  AWN_emission_co_2_prf?: string;
  AWN_depollution?: string;
  AWN_k_type?: string;
  AWN_version?: string;
  AWN_label?: string;
  AWN_code_moteur?: string;
  AWN_nbr_soupapes?: string;
  AWN_propulsion?: string;
  AWN_date_cg?: string;
  AWN_collection?: string;
  AWN_segment?: string;
  AWN_type_frein?: string;
  AWN_group?: string;
  AWN_generation?: string;
  AWN_poids_total_roulant?: string;
  AWN_mode_injection?: string;
  AWN_type_injection?: string;
  AWN_turbo_compressor?: string;
  AWN_vitesse_moteur?: string;
  AWN_marque?: string;
  // Champs standard du véhicule
  marque?: string;
  VIN?: string;
  dateMiseEnCirculation?: string;
  puissanceFiscale?: string;
  puissanceDin?: string;
  energie?: string;
}

/**
 * Appelle l'API SIV AWN pour récupérer les infos d'un véhicule français
 */
export const getSivVehicleInfo = async (immatriculation: string): Promise<SivVehicleData | null> => {
  try {
    // Nettoyer l'immatriculation (retirer espaces et tirets)
    const cleanImmat = immatriculation.replace(/[\s-]/g, '').toUpperCase();
    
    console.log(`🔍 SIV: Recherche pour ${cleanImmat}...`);
    
    const response = await fetch(
      `${SIV_API_BASE_URL}/v1/fr?immat=${cleanImmat}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SIV_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.error(`❌ SIV API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`✅ SIV: Données reçues pour ${cleanImmat}`, data);
    
    // Vérifier si l'API a retourné des données valides
    if (!data || data.error) {
      console.warn(`⚠️ SIV: Pas de données valides pour ${cleanImmat}`, data?.error);
      return null;
    }
    
    // Mapper les données API vers les champs AWN_*
    return mapSivResponseToAwnFields(data);
  } catch (error) {
    console.error(`❌ SIV: Erreur pour ${immatriculation}:`, error);
    return null;
  }
};

/**
 * Mappe la réponse API SIV vers les champs AWN_* du véhicule
 */
const mapSivResponseToAwnFields = (apiData: any): SivVehicleData => {
  // L'API peut retourner les données directement ou dans un objet "data"
  const d = apiData.data || apiData;
  
  return {
    // Champs AWN_*
    AWN_VIN: d.vin || d.VIN || d.numero_serie,
    AWN_genre: d.genre || d.type_vehicule,
    AWN_nom_commercial: d.nom_commercial || d.designation_commerciale,
    AWN_numero_de_serie: d.numero_serie || d.vin,
    AWN_model: d.modele || d.model,
    AWN_model_image: d.model_image || d.image_modele,
    AWN_url_image: d.url_image || d.image_url || d.image,
    AWN_energie_code: d.energie_code || d.energie || d.carburant,
    AWN_puissance_KW: String(d.puissance_kw || d.puissance_KW || d.puissanceKw || ''),
    AWN_max_speed: String(d.vitesse_max || d.max_speed || ''),
    AWN_nbr_places: String(d.nb_places || d.places || d.nombre_places || ''),
    AWN_nbr_portes: String(d.nb_portes || d.portes || d.nombre_portes || ''),
    AWN_nbr_vitesses: String(d.nb_vitesses || d.vitesses || ''),
    AWN_nbr_cylindres: String(d.nb_cylindres || d.cylindres || ''),
    AWN_poids_vide: String(d.poids_vide || d.masse_vide || ''),
    AWN_poids_total: String(d.poids_total || d.masse_totale || ''),
    AWN_poids_max_autorise: String(d.ptac || d.poids_max_autorise || ''),
    AWN_consommation_urbaine: String(d.conso_urbaine || d.consommation_urbaine || ''),
    AWN_consommation_ex_urbaine: String(d.conso_extra_urbaine || d.consommation_extra_urbaine || ''),
    AWN_consommation_mixte: String(d.conso_mixte || d.consommation_mixte || ''),
    AWN_emission_co_2_prf: String(d.emission_co2 || d.co2 || ''),
    AWN_depollution: d.depollution || d.norme_euro,
    AWN_k_type: d.k_type || d.ktype,
    AWN_version: d.version,
    AWN_label: d.label,
    AWN_code_moteur: d.code_moteur,
    AWN_nbr_soupapes: String(d.nb_soupapes || d.soupapes || ''),
    AWN_propulsion: d.propulsion || d.transmission,
    AWN_date_cg: d.date_cg || d.date_carte_grise,
    AWN_collection: d.collection,
    AWN_segment: d.segment,
    AWN_type_frein: d.type_frein,
    AWN_group: d.groupe || d.group,
    AWN_generation: d.generation,
    AWN_poids_total_roulant: String(d.poids_total_roulant || d.ptra || ''),
    AWN_mode_injection: d.mode_injection,
    AWN_type_injection: d.type_injection,
    AWN_turbo_compressor: d.turbo || d.turbo_compressor,
    AWN_vitesse_moteur: String(d.vitesse_moteur || d.regime_moteur || ''),
    AWN_marque: d.marque || d.brand,
    // Champs standard
    marque: d.marque || d.brand,
    VIN: d.vin || d.VIN || d.numero_serie,
    dateMiseEnCirculation: d.date_mise_circulation || d.date_1ere_immat,
    puissanceFiscale: String(d.puissance_fiscale || d.cv_fiscaux || ''),
    puissanceDin: String(d.puissance_din || d.puissance_ch || ''),
    energie: d.energie || d.carburant,
  };
};

/**
 * Vérifie les crédits disponibles sur le compte AWN
 */
export const checkSivCredits = async (): Promise<{ credits: number; success: boolean }> => {
  try {
    const response = await fetch(
      `${SIV_API_BASE_URL}/my-account/credits`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SIV_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      return { credits: 0, success: false };
    }
    
    const data = await response.json();
    return { credits: data.credits || 0, success: true };
  } catch (error) {
    console.error('Erreur vérification crédits SIV:', error);
    return { credits: 0, success: false };
  }
};
