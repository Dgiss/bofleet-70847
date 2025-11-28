import { getLazyClient, waitForAmplifyConfig, withCredentialRetry } from '@/config/aws-config.js';
import { useCallback, useState } from 'react';
import * as queries from '../graphql/queries';

const client = getLazyClient();

interface Company {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  mobile?: string;
  city?: string;
  siret?: string;
  address?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  fax?: string;
  creationDate?: string;
  subscriptionDate?: string;
  keyedStart?: boolean;
  users?: {
    items: any[];
  };
}

export const useInfiniteCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      await waitForAmplifyConfig();
      
      const variables = {
        limit: 50,
        nextToken: nextToken
      };

      const result: any = await withCredentialRetry(async () => {
        return await client.graphql({
          query: queries.listCompanies,
          variables: variables
        });
      });

      const data = result.data.listCompanies;
      const newCompanies = data.items || [];

      setCompanies(prev => [...prev, ...newCompanies]);
      setNextToken(data.nextToken || null);
      setHasMore(!!data.nextToken);

    } catch (err) {
      console.error('Error loading companies:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, nextToken]);

  const reset = useCallback(() => {
    setCompanies([]);
    setNextToken(null);
    setHasMore(true);
    setError(null);
  }, []);

  const searchByFilters = useCallback(async (searchName?: string, searchEmail?: string, searchSiret?: string) => {
    setLoading(true);
    setError(null);

    try {
      await waitForAmplifyConfig();
      
      const hasSearchName = searchName && searchName.trim();
      const hasSearchEmail = searchEmail && searchEmail.trim();
      const hasSearchSiret = searchSiret && searchSiret.trim();

      if (!hasSearchName && !hasSearchEmail && !hasSearchSiret) {
        throw new Error("Veuillez saisir au moins un critère de recherche");
      }

      let allCompanies: Company[] = [];
      let searchToken: string | null = null;

      // Récupérer toutes les entreprises sans filtre sur le nom pour gérer la recherche insensible à la casse
      const filtersArray = [];
      
      if (hasSearchSiret) {
        filtersArray.push({ siret: { contains: searchSiret.trim() } });
      }
      
      if (hasSearchEmail) {
        filtersArray.push({ email: { contains: searchEmail.trim() } });
      }

      await withCredentialRetry(async () => {
        do {
          const variables: any = {
            limit: 1000,
            nextToken: searchToken
          };

          // Ajouter le filtre seulement si on a SIRET ou Email (pas pour le nom)
          if (filtersArray.length > 0) {
            variables.filter = {
              or: filtersArray
            };
          }

          const result: any = await client.graphql({
            query: queries.listCompanies,
            variables: variables
          });

          const data = result.data.listCompanies;
          allCompanies = [...allCompanies, ...(data.items || [])];
          searchToken = data.nextToken || null;
        } while (searchToken);
      });

      // Filtrer côté client pour la recherche insensible à la casse sur le nom
      if (hasSearchName) {
        const searchNameLower = searchName.trim().toLowerCase();
        allCompanies = allCompanies.filter(company => 
          company.name?.toLowerCase().includes(searchNameLower)
        );
      }

      setCompanies(allCompanies);
      setHasMore(false);
      setNextToken(null);

      return allCompanies;

    } catch (err) {
      console.error('Error searching companies:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompany = useCallback((updatedCompany: Company) => {
    setCompanies(prevCompanies => 
      prevCompanies.map(company => 
        company.id === updatedCompany.id ? { ...company, ...updatedCompany } : company
      )
    );
  }, []);

  return {
    companies,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    searchByFilters,
    updateCompany
  };
};
