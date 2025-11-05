import { useState, useCallback, useRef } from 'react';
import { listTruphoneSimsPaged, TruphoneSim } from '@/services/TruphoneService';
import { toast } from '@/hooks/use-toast';

export const useInfiniteTruphoneSims = () => {
  const [sims, setSims] = useState<TruphoneSim[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const perPageRef = useRef(500);

  const loadMore = useCallback(async (customPerPage?: number) => {
    if (isLoadingRef.current || !hasMore) {
      console.log('Skipping load: already loading or no more data');
      return;
    }

    const perPage = customPerPage || perPageRef.current;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await listTruphoneSimsPaged(currentPageRef.current, perPage);

      console.log(`Loaded ${result.sims.length} Truphone SIMs, hasMore:`, result.hasMore);

      setSims(prev => [...prev, ...result.sims]);
      currentPageRef.current = result.page + 1;
      setHasMore(result.hasMore);

      if (!result.hasMore) {
        const totalCount = sims.length + result.sims.length;
        toast({
          title: "Chargement terminé",
          description: `${totalCount} SIMs Truphone chargées au total`,
        });
      }
    } catch (err: any) {
      console.error('Error loading Truphone SIMs:', err);
      setError(err.message || 'Erreur lors du chargement');
      toast({
        title: "Erreur",
        description: `Erreur Truphone: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [hasMore, sims.length]);

  const reset = useCallback(() => {
    setSims([]);
    currentPageRef.current = 1;
    setHasMore(true);
    setError(null);
    perPageRef.current = 500;
  }, []);

  return {
    sims,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
  };
};
