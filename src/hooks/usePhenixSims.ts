import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPhenixSims, PhenixSim, refreshPhenixAuth } from '@/services/PhenixService';
import { useToast } from '@/components/ui/use-toast';

export function usePhenixSims() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupérer les SIMs avec cache React Query
  const { 
    data: sims, 
    isLoading, 
    error, 
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['phenix-sims'],
    queryFn: listPhenixSims,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    gcTime: 30 * 60 * 1000,   // Garder en cache 30 minutes
    retry: 1,
  });

  // Mutation pour forcer la synchronisation
  const syncMutation = useMutation({
    mutationFn: async () => {
      // Rafraîchir l'authentification pour avoir un token frais
      await refreshPhenixAuth();
      // Puis récupérer les SIMs
      return listPhenixSims();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['phenix-sims'], data);
      toast({
        title: "Synchronisation Phenix réussie",
        description: `${data.length} SIM(s) synchronisée(s)`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    sims: sims || [],
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
    syncSims: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}
