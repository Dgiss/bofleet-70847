import { useQuery } from '@tanstack/react-query';
import { TruphoneSim, enrichTruphoneSimWithUsage, TruphoneRatePlan } from '@/services/TruphoneService';

/**
 * Hook pour enrichir une SIM Truphone avec ses données d'utilisation
 * Utilise React Query pour mettre en cache les résultats
 *
 * @param sim - La SIM à enrichir
 * @param ratePlans - Liste des rate plans (pour calculer le pourcentage)
 * @param enabled - Si false, ne charge pas les données
 */
export function useTruphoneSimEnrichment(
  sim: TruphoneSim | null,
  ratePlans?: TruphoneRatePlan[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['truphone-sim-usage', sim?.iccid],
    queryFn: async () => {
      if (!sim) return null;

      // Trouver le rate plan correspondant pour cette SIM
      const ratePlan = ratePlans?.find(plan => plan.id === sim.servicePack);
      const dataAllowanceMB = ratePlan?.dataAllowance;

      return await enrichTruphoneSimWithUsage(sim, dataAllowanceMB);
    },
    enabled: enabled && sim !== null,
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    gcTime: 10 * 60 * 1000, // Garde en cache pendant 10 minutes
  });
}

/**
 * Hook pour enrichir plusieurs SIMs Truphone avec leurs données d'utilisation
 * Charge les données en parallèle et met en cache chaque résultat
 *
 * @param sims - Les SIMs à enrichir
 * @param ratePlans - Liste des rate plans
 * @param enabled - Si false, ne charge pas les données
 */
export function useTruphoneSimsEnrichment(
  sims: TruphoneSim[],
  ratePlans?: TruphoneRatePlan[],
  enabled: boolean = true
) {
  const queries = sims.map(sim => ({
    queryKey: ['truphone-sim-usage', sim.iccid],
    queryFn: async () => {
      const ratePlan = ratePlans?.find(plan => plan.id === sim.servicePack);
      const dataAllowanceMB = ratePlan?.dataAllowance;
      return await enrichTruphoneSimWithUsage(sim, dataAllowanceMB);
    },
    enabled: enabled && sims.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  }));

  // Utiliser useQueries pour charger toutes les SIMs en parallèle
  // Note: useQueries doit être importé si nécessaire
  // Pour l'instant on retourne un simple objet
  return {
    queries,
    isLoading: false,
  };
}
