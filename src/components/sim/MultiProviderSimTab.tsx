import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EnhancedDataTable, Column } from "@/components/tables/EnhancedDataTable";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Zap } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { listAllThingsMobileSims, getThingsMobileSimStatus } from "@/services/ThingsMobileService";
import { listPhenixSims } from "@/services/PhenixService";
import { listTruphoneSims, listTruphoneSimsPaged, enrichTruphoneSimsWithUsage, enrichTruphoneSimWithUsage, getAvailableTruphoneRatePlans, getTruphoneSimStatus } from "@/services/TruphoneService";
import { RechargeSimDialog } from "@/components/dialogs/RechargeSimDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnifiedSim {
  id: string;
  provider: "Things Mobile" | "Phenix" | "Truphone";
  msisdn: string;
  iccid: string;
  status: string;
  name?: string;
  tag?: string;
  dataUsage?: string;
  lastConnection?: string;
  label?: string;
  description?: string;
  imei?: string;
  servicePack?: string;
  simType?: string;
  organizationName?: string;
  // Données d'utilisation détaillées (Truphone)
  dataUsageBytes?: number;
  dataAllowanceBytes?: number;
  dataUsagePercent?: number;
  smsCount?: number;
  callDurationMinutes?: number;
  isLowData?: boolean; // true si l'utilisation dépasse le seuil d'alerte
  // Données de statut détaillé (Truphone)
  allowedData?: string;
  remainingData?: string;
  allowedTime?: string;
  remainingTime?: string;
  testStateStartDate?: string;
  _truphoneSimRef?: any; // Référence à la SIM Truphone originale pour enrichissement lazy
  _enriched?: boolean; // Marque si la SIM a été enrichie
}

interface ProviderStatus {
  provider: string;
  status: "loading" | "success" | "error";
  count: number;
  error?: string;
}

const statusToBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "activated":
      return "outline"; // Green outline for active SIMs
    case "suspended":
      return "secondary"; // Gray for suspended
    case "to-activate":
    case "test_ready":
    case "inventory":
      return "default"; // Blue for pending activation/test
    case "deactivated":
    case "not active":
    case "inactive":
    case "retired":
      return "destructive"; // Red for inactive
    case "unknown":
      return "secondary"; // Gray for unknown status
    default:
      return "secondary"; // Gray for any other status
  }
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "—";
  const mb = bytes / 1_000_000;
  return `${mb.toFixed(2)} MB`;
};

// Seuils d'alerte pour l'utilisation des données
const DATA_USAGE_THRESHOLDS = {
  WARNING: 70, // 70% = Avertissement (jaune)
  CRITICAL: 85, // 85% = Critique (orange)
  DEPLETED: 95, // 95% = Presque épuisé (rouge)
};

const getDataUsageBadgeVariant = (usagePercent?: number) => {
  if (!usagePercent) return "secondary";
  if (usagePercent >= DATA_USAGE_THRESHOLDS.DEPLETED) return "destructive"; // Rouge
  if (usagePercent >= DATA_USAGE_THRESHOLDS.CRITICAL) return "default"; // Orange/Bleu
  if (usagePercent >= DATA_USAGE_THRESHOLDS.WARNING) return "outline"; // Jaune
  return "secondary"; // Vert/Gris
};

const formatDataUsageWithPercent = (usageBytes?: number, allowanceBytes?: number, usagePercent?: number) => {
  if (!usageBytes) return "—";

  const usageMB = (usageBytes / 1_000_000).toFixed(2);

  if (allowanceBytes && usagePercent !== undefined) {
    const allowanceMB = (allowanceBytes / 1_000_000).toFixed(0);
    return `${usageMB} / ${allowanceMB} MB (${usagePercent.toFixed(1)}%)`;
  }

  return `${usageMB} MB`;
};

const statusToDisplayText = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
    case "activated":
      return "ACTIF";
    case "inactive":
    case "deactivated":
      return "INACTIF";
    case "suspended":
      return "SUSPENDU";
    case "to-activate":
      return "À ACTIVER";
    case "test_ready":
      return "TEST PRÊT";
    case "inventory":
      return "INVENTAIRE";
    case "retired":
      return "RETIRÉ";
    case "unknown":
      return "STATUT INCONNU";
    default:
      return status ? status.toUpperCase() : "—";
  }
};

export function MultiProviderSimTab() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSimForRecharge, setSelectedSimForRecharge] = useState<UnifiedSim | null>(null);
  // Filtres
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dataAlertFilter, setDataAlertFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([
    { provider: "Things Mobile", status: "loading", count: 0 },
    { provider: "Phenix", status: "loading", count: 0 },
    { provider: "Truphone", status: "loading", count: 0 },
  ]);
  const [enrichmentProgress, setEnrichmentProgress] = useState({ current: 0, total: 0 });
  const [isEnriching, setIsEnriching] = useState(false);
  const enrichmentDoneRef = useRef(false);
  const lastDataUpdateRef = useRef(0);

  // Charger les SIMs progressivement (un opérateur après l'autre)
  const [allSims, setAllSims] = useState<UnifiedSim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState<UnifiedSim[]>([]);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  const loadSimsProgressively = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAllSims([]); // Réinitialiser

    const newStatuses: ProviderStatus[] = [];
    console.log("🔄 Chargement progressif des opérateurs (un par un)...");
    const startTime = Date.now();

    try {
      // 1. Things Mobile EN PREMIER (le plus rapide généralement)
      try {
        console.log("📱 Chargement Things Mobile...");
        const tmSims = await listAllThingsMobileSims();
        const tmUnified = tmSims.map((sim) => ({
          id: `tm-${sim.iccid || sim.msisdn}`,
          provider: "Things Mobile" as const,
          msisdn: sim.msisdn || "—",
          iccid: sim.iccid || "—",
          status: sim.status || "unknown",
          name: sim.name,
          tag: sim.tag,
          dataUsage: formatBytes(sim.monthlyTrafficBytes),
          lastConnection: sim.lastConnectionDate,
        }));

        setAllSims(prev => [...prev, ...tmUnified]); // Afficher immédiatement
        newStatuses.push({
          provider: "Things Mobile",
          status: "success",
          count: tmUnified.length,
        });
        console.log(`✅ Things Mobile: ${tmUnified.length} SIMs affichées`);
      } catch (err: any) {
        console.error("❌ Things Mobile error:", err);
        newStatuses.push({
          provider: "Things Mobile",
          status: "error",
          count: 0,
          error: err.message,
        });
      }

      // 2. Phenix EN DEUXIÈME
      try {
        console.log("📱 Chargement Phenix...");
        const phenixSims = await listPhenixSims();
        const phenixUnified = phenixSims.map((sim) => ({
          id: `phenix-${sim.iccid || sim.msisdn}`,
          provider: "Phenix" as const,
          msisdn: sim.msisdn || "—",
          iccid: sim.iccid || "—",
          status: sim.status || "unknown",
        }));

        setAllSims(prev => [...prev, ...phenixUnified]); // Afficher immédiatement
        newStatuses.push({
          provider: "Phenix",
          status: "success",
          count: phenixUnified.length,
        });
        console.log(`✅ Phenix: ${phenixUnified.length} SIMs affichées`);
      } catch (err: any) {
        console.error("❌ Phenix error:", err);
        newStatuses.push({
          provider: "Phenix",
          status: "error",
          count: 0,
          error: err.message,
        });
      }

      // 3. Truphone EN DERNIER (le plus lent) - CHARGEMENT DE LA PREMIÈRE PAGE SEULEMENT
      try {
        console.log("📱 Chargement Truphone (première page uniquement pour affichage rapide)...");

        // Charger SEULEMENT la première page pour affichage rapide
        const pageResult = await listTruphoneSimsPaged(1, 500);

        if (pageResult.sims.length > 0) {
          const truphoneUnified = pageResult.sims.map((sim) => ({
            id: `truphone-${sim.iccid || sim.simId}`,
            provider: "Truphone" as const,
            msisdn: sim.msisdn || "—",
            iccid: sim.iccid || "—",
            status: sim.status || "unknown",
            label: sim.label,
            description: sim.description,
            imei: sim.imei,
            servicePack: sim.servicePack,
            simType: sim.simType,
            organizationName: sim.organizationName,
            dataUsageBytes: undefined,
            dataAllowanceBytes: undefined,
            dataUsagePercent: undefined,
            smsCount: undefined,
            callDurationMinutes: undefined,
            isLowData: false,
            _truphoneSimRef: sim,
          }));

          setAllSims(prev => [...prev, ...truphoneUnified]); // Afficher IMMÉDIATEMENT
          console.log(`✅ Truphone: ${truphoneUnified.length} SIMs affichées (première page)`);

          newStatuses.push({
            provider: "Truphone",
            status: "success",
            count: truphoneUnified.length,
          });
        }

        console.log(`ℹ️ Truphone: Affichage rapide activé - Seule la première page est chargée`);
      } catch (err: any) {
        console.error("❌ Truphone error:", err);
        newStatuses.push({
          provider: "Truphone",
          status: "error",
          count: 0,
          error: err.message,
        });
      }

      const duration = Date.now() - startTime;
      setProviderStatuses(newStatuses);
      console.log(`📊 Total: ${allSims.length} SIMs chargées en ${duration}ms`);
    } catch (err: any) {
      console.error("❌ Erreur générale:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    loadSimsProgressively();
  }, []);

  const refetch = () => {
    loadSimsProgressively();
  };

  const dataUpdatedAt = Date.now(); // Simuler pour compatibilité

  // Recherche API OPTIMISÉE avec appels directs (pas de pagination)
  const searchSimByApi = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setApiSearchResults([]);
      return;
    }

    // Annuler la recherche précédente si elle est en cours
    if (searchAbortControllerRef.current) {
      console.log("🚫 Annulation de la recherche API précédente");
      searchAbortControllerRef.current.abort();
    }

    // Créer un nouveau controller pour cette recherche
    const abortController = new AbortController();
    searchAbortControllerRef.current = abortController;

    setIsSearching(true);
    console.log(`🔍 Recherche API OPTIMISÉE pour: "${query}"`);

    try {
      const results: UnifiedSim[] = [];

      // Déterminer le type de recherche
      // Note: Priorité IMEI > ICCID > MSISDN car ils peuvent se chevaucher en longueur
      const looksLikeImei = /^\d{15}$/.test(query); // IMEI = exactement 15 chiffres
      const looksLikeIccid = /^\d{13,20}$/.test(query) && !looksLikeImei; // ICCID = 13-20 chiffres (mais pas 15)
      const looksLikeMsisdn = /^\d{10,12}$/.test(query); // MSISDN = 10-12 chiffres

      // Vérifier si la recherche a été annulée
      if (abortController.signal.aborted) {
        console.log("🚫 Recherche annulée par l'utilisateur");
        return;
      }

      // 1. Recherche directe Truphone par ICCID (ULTRA RAPIDE - 1 seul appel API)
      if (looksLikeIccid) {
        let truphoneFound = false;

        try {
          console.log(`🎯 Recherche directe Truphone par ICCID: ${query}`);
          const startTime = Date.now();

          const truphoneSim = await getTruphoneSimStatus(query);

          const duration = Date.now() - startTime;
          console.log(`⚡ Recherche Truphone terminée en ${duration}ms`);

          if (truphoneSim) {
            const unified: UnifiedSim = {
              id: `truphone-api-${truphoneSim.iccid}`,
              provider: "Truphone" as const,
              msisdn: truphoneSim.msisdn || "—",
              iccid: truphoneSim.iccid || "—",
              status: truphoneSim.status || "unknown",
              imei: truphoneSim.imei,
              servicePack: truphoneSim.servicePack,
              simType: truphoneSim.simType,
              organizationName: truphoneSim.organizationName,
              dataUsageBytes: undefined,
              dataAllowanceBytes: undefined,
              dataUsagePercent: undefined,
              smsCount: undefined,
              callDurationMinutes: undefined,
              isLowData: false,
              _truphoneSimRef: truphoneSim,
            };

            results.push(unified);
            truphoneFound = true;
            console.log(`✅ SIM Truphone trouvée via API directe:`, unified);
          } else {
            console.log(`⚠️ Aucune SIM Truphone trouvée pour ICCID exact: ${query}`);
          }
        } catch (err: any) {
          const statusCode = err.response?.status || 'unknown';
          console.warn(`⚠️ Recherche directe Truphone échouée (HTTP ${statusCode}), tentative avec recherche partielle...`);
          console.log(`   Raison: ${err.message}`);
        }

        // Fallback: Si l'API directe échoue (404 ou autre), chercher avec contains dans la pagination
        if (!truphoneFound) {
          console.log(`🔍 Fallback Truphone: truphoneFound=${truphoneFound}, lancement de la recherche partielle...`);

          try {
            console.log(`📄 Recherche partielle Truphone pour "${query}" dans toutes les pages...`);
            let page = 1;
            let foundCount = 0;
            let totalScanned = 0;
            const maxPages = 5; // Limiter à 5 pages = 2500 SIMs pour recherche partielle

            while (page <= maxPages && foundCount === 0) {
              console.log(`   📄 Scan page ${page}/${maxPages}...`);
              const pageResult = await listTruphoneSimsPaged(page, 500);

              if (pageResult.sims.length === 0) {
                console.log(`   📄 Page ${page} vide, arrêt de la recherche`);
                break;
              }

              totalScanned += pageResult.sims.length;
              console.log(`   📄 Page ${page}: ${pageResult.sims.length} SIMs récupérées (total scanné: ${totalScanned})`);

              // Recherche avec contains (partielle) pour l'ICCID
              const matched = pageResult.sims.filter(sim =>
                sim.iccid && String(sim.iccid).includes(query)
              );

              if (matched.length > 0) {
                console.log(`   🎯 Correspondance(s) trouvée(s)! ICCIDs: ${matched.map(s => s.iccid).join(', ')}`);

                const truphoneUnified = matched.map((sim) => ({
                  id: `truphone-api-${sim.iccid || sim.simId}`,
                  provider: "Truphone" as const,
                  msisdn: sim.msisdn || "—",
                  iccid: sim.iccid || "—",
                  status: sim.status || "unknown",
                  label: sim.label,
                  description: sim.description,
                  imei: sim.imei,
                  servicePack: sim.servicePack,
                  simType: sim.simType,
                  organizationName: sim.organizationName,
                  dataUsageBytes: undefined,
                  dataAllowanceBytes: undefined,
                  dataUsagePercent: undefined,
                  smsCount: undefined,
                  callDurationMinutes: undefined,
                  isLowData: false,
                  _truphoneSimRef: sim,
                }));

                results.push(...truphoneUnified);
                foundCount += truphoneUnified.length;
                console.log(`✅ Trouvé ${truphoneUnified.length} SIM(s) Truphone via recherche partielle (page ${page}, ${totalScanned} SIMs scannées)`);
                break;
              }

              if (!pageResult.hasMore) {
                console.log(`   📄 Dernière page atteinte (page ${page})`);
                break;
              }

              page++;
            }

            if (foundCount === 0) {
              console.log(`⚠️ Aucune SIM Truphone trouvée après avoir scanné ${totalScanned} SIMs sur ${page} page(s)`);
              console.log(`💡 Astuce: Si vous cherchez un ICCID partiel (ex: ${query}), essayez avec l'ICCID complet du portail Truphone (ex: 89444${query})`);
            }
          } catch (fallbackErr) {
            console.error("❌ Erreur fallback Truphone:", fallbackErr);
          }
        } else {
          console.log(`✓ Truphone trouvée via API directe, pas besoin de fallback`);
        }
      }

      // 2. Recherche directe Things Mobile par ICCID ou MSISDN (ULTRA RAPIDE - 1 seul appel API)
      if (looksLikeIccid || looksLikeMsisdn) {
        try {
          const searchParam = looksLikeIccid ? 'ICCID' : 'MSISDN';
          console.log(`🎯 Recherche directe Things Mobile par ${searchParam}: ${query}`);
          const startTime = Date.now();

          const tmSim = await getThingsMobileSimStatus(
            looksLikeIccid ? { iccid: query } : { msisdn: query }
          );

          const duration = Date.now() - startTime;
          console.log(`⚡ Recherche Things Mobile terminée en ${duration}ms`);

          if (tmSim) {
            const unified: UnifiedSim = {
              id: `tm-api-${tmSim.iccid || tmSim.msisdn}`,
              provider: "Things Mobile" as const,
              msisdn: tmSim.msisdn || "—",
              iccid: tmSim.iccid || "—",
              status: tmSim.status || "unknown",
              name: tmSim.name,
              tag: tmSim.tag,
              dataUsage: formatBytes(tmSim.monthlyTrafficBytes),
              lastConnection: tmSim.lastConnectionDate,
            };

            results.push(unified);
            console.log(`✅ SIM Things Mobile trouvée:`, unified);
          } else {
            console.log(`⚠️ Aucune SIM Things Mobile trouvée pour ${searchParam}: ${query}`);
          }
        } catch (err: any) {
          console.warn("⚠️ Recherche directe Things Mobile échouée, tentative avec liste complète...");

          // Fallback: Rechercher dans la liste complète Things Mobile
          try {
            const tmSims = await listAllThingsMobileSims();
            const searchLower = query.toLowerCase();

            const matched = tmSims.find(sim =>
              (sim.iccid && String(sim.iccid).toLowerCase() === searchLower) ||
              (sim.msisdn && String(sim.msisdn).toLowerCase() === searchLower)
            );

            if (matched) {
              const unified: UnifiedSim = {
                id: `tm-api-${matched.iccid || matched.msisdn}`,
                provider: "Things Mobile" as const,
                msisdn: matched.msisdn || "—",
                iccid: matched.iccid || "—",
                status: matched.status || "unknown",
                name: matched.name,
                tag: matched.tag,
                dataUsage: formatBytes(matched.monthlyTrafficBytes),
                lastConnection: matched.lastConnectionDate,
              };

              results.push(unified);
              console.log(`✅ SIM Things Mobile trouvée via fallback:`, unified);
            } else {
              console.log(`⚠️ Aucune SIM Things Mobile trouvée (même via fallback)`);
            }
          } catch (fallbackErr) {
            console.error("❌ Erreur fallback Things Mobile:", fallbackErr);
          }
        }
      }

      // 3. Pour les recherches IMEI (15 chiffres exactement), utiliser l'ancienne méthode de pagination
      // car l'IMEI n'est pas la clé primaire de recherche
      if (looksLikeImei && !looksLikeIccid) {
        console.log(`🔍 Recherche par IMEI (pagination nécessaire): ${query}`);
        try {
          let page = 1;
          let foundCount = 0;
          const maxPages = 10; // Limiter à 10 pages = 5000 SIMs max

          while (page <= maxPages && foundCount === 0) {
            const pageResult = await listTruphoneSimsPaged(page, 500);

            if (pageResult.sims.length === 0) break;

            const matched = pageResult.sims.filter(sim =>
              sim.imei && String(sim.imei) === query // Comparaison exacte pour IMEI
            );

            if (matched.length > 0) {
              const truphoneUnified = matched.map((sim) => ({
                id: `truphone-api-${sim.iccid || sim.simId}`,
                provider: "Truphone" as const,
                msisdn: sim.msisdn || "—",
                iccid: sim.iccid || "—",
                status: sim.status || "unknown",
                label: sim.label,
                description: sim.description,
                imei: sim.imei,
                servicePack: sim.servicePack,
                simType: sim.simType,
                organizationName: sim.organizationName,
                dataUsageBytes: undefined,
                dataAllowanceBytes: undefined,
                dataUsagePercent: undefined,
                smsCount: undefined,
                callDurationMinutes: undefined,
                isLowData: false,
                _truphoneSimRef: sim,
              }));

              results.push(...truphoneUnified);
              foundCount += truphoneUnified.length;
              console.log(`✅ Trouvé ${truphoneUnified.length} SIM(s) Truphone avec IMEI ${query}`);
              break; // Arrêter dès qu'on trouve
            }

            if (!pageResult.hasMore) break;
            page++;
          }

          console.log(`📊 Recherche IMEI: ${foundCount} résultat(s) sur ${page} page(s)`);
        } catch (err) {
          console.error("Erreur recherche IMEI Truphone:", err);
        }
      }

      setApiSearchResults(results);

      if (results.length > 0) {
        toast({
          description: `✅ ${results.length} résultat(s) trouvé(s) en ${looksLikeIccid ? '< 2 secondes' : 'quelques secondes'}`,
          duration: 3000,
        });
      } else {
        // Suggestion si la recherche échoue avec un ICCID court
        const suggestionText = looksLikeIccid && query.length < 19
          ? ` Essayez avec l'ICCID complet (19 chiffres) depuis le portail Truphone.`
          : '';

        toast({
          variant: "destructive",
          description: `❌ Aucun résultat trouvé pour "${query}".${suggestionText}`,
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Erreur recherche API:", err);
      toast({
        variant: "destructive",
        description: "Erreur lors de la recherche API",
        duration: 3000,
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Debounce de la recherche API avec détection intelligente
  useEffect(() => {
    // Nettoyer les résultats API si la recherche est vide
    if (!searchValue) {
      setApiSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      // Ne lancer la recherche API que si aucun résultat local n'est trouvé
      const search = searchValue.toLowerCase();
      const localResults = allSims.filter((sim) => {
        return (
          (sim.msisdn && String(sim.msisdn).toLowerCase().includes(search)) ||
          (sim.iccid && String(sim.iccid).toLowerCase().includes(search)) ||
          (sim.imei && String(sim.imei).toLowerCase().includes(search)) ||
          (sim.provider && String(sim.provider).toLowerCase().includes(search)) ||
          (sim.name && String(sim.name).toLowerCase().includes(search)) ||
          (sim.label && String(sim.label).toLowerCase().includes(search))
        );
      });

      console.log(`🔍 Recherche locale pour "${searchValue}": ${localResults.length} résultat(s) trouvé(s) dans ${allSims.length} SIMs`);

      // Critères pour lancer la recherche API (OPTIMISÉE):
      // 1. Aucun résultat local trouvé
      // 2. Requête ressemble à:
      //    - ICCID (13-20 chiffres) → recherche directe ultra-rapide
      //    - MSISDN (10-12 chiffres) → recherche directe ultra-rapide
      //    - IMEI (exactement 15 chiffres) → pagination nécessaire mais limitée
      // Note: Priorité IMEI > ICCID > MSISDN
      const looksLikeImei = /^\d{15}$/.test(searchValue);
      const looksLikeIccid = /^\d{13,20}$/.test(searchValue) && !looksLikeImei;
      const looksLikeMsisdn = /^\d{10,12}$/.test(searchValue);
      const isValidSearchFormat = looksLikeIccid || looksLikeMsisdn || looksLikeImei;

      if (localResults.length === 0 && isValidSearchFormat) {
        const searchType = looksLikeIccid ? 'ICCID (recherche ultra-rapide)' :
                          looksLikeMsisdn ? 'MSISDN (recherche ultra-rapide)' :
                          'IMEI (recherche avec pagination)';
        console.log(`🚀 Lancement recherche API pour ${searchType}: "${searchValue}"`);
        searchSimByApi(searchValue);
      } else {
        setApiSearchResults([]);
        if (localResults.length > 0) {
          console.log(`✅ Résultats trouvés localement, pas besoin de recherche API`);
        } else if (!isValidSearchFormat) {
          console.log(`⚠️ Format invalide pour recherche API. Requis: ICCID (13-20 chiffres), MSISDN (10-12 chiffres) ou IMEI (15 chiffres)`);
        }
      }
    }, 800); // Réduit à 800ms car la recherche directe est ultra-rapide maintenant

    return () => clearTimeout(timer);
  }, [searchValue, allSims, searchSimByApi]);

  // Enrichissement progressif des SIMs Truphone en arrière-plan
  useEffect(() => {
    // Vérifier si les données ont changé (nouveau chargement)
    if (dataUpdatedAt !== lastDataUpdateRef.current) {
      lastDataUpdateRef.current = dataUpdatedAt;
      enrichmentDoneRef.current = false; // Réinitialiser pour le nouveau chargement
    }

    const enrichTruphoneSims = async () => {
      // Ne pas enrichir si on est déjà en train d'enrichir, si on est en chargement, ou si c'est déjà fait
      if (isEnriching || isLoading || allSims.length === 0 || enrichmentDoneRef.current) return;

      // Trouver les SIMs Truphone non enrichies
      const truphoneSims = allSims.filter(
        sim => sim.provider === "Truphone" && !sim._enriched && sim._truphoneSimRef
      );

      if (truphoneSims.length === 0) {
        enrichmentDoneRef.current = true;
        return;
      }

      setIsEnriching(true);
      setEnrichmentProgress({ current: 0, total: truphoneSims.length });
      console.log(`🔄 Démarrage de l'enrichissement progressif: ${truphoneSims.length} SIMs Truphone`);

      try {
        // Charger les rate plans une seule fois
        const ratePlans = await getAvailableTruphoneRatePlans();
        console.log(`📋 ${ratePlans.length} rate plan(s) disponibles pour l'enrichissement`);

        // Enrichir par batch de 5 SIMs pour ne pas surcharger l'API
        const BATCH_SIZE = 5;
        let enrichedCount = 0;

        for (let i = 0; i < truphoneSims.length; i += BATCH_SIZE) {
          const batch = truphoneSims.slice(i, i + BATCH_SIZE);

          // Enrichir le batch en parallèle
          const enrichPromises = batch.map(async (unifiedSim) => {
            const sim = unifiedSim._truphoneSimRef;
            const ratePlan = ratePlans?.find(plan => plan.id === sim.servicePack);
            const dataAllowanceMB = ratePlan?.dataAllowance;

            try {
              const enrichedSim = await enrichTruphoneSimWithUsage(sim, dataAllowanceMB);

              // Mettre à jour la SIM dans le cache React Query
              queryClient.setQueryData(["all-sims"], (oldData: UnifiedSim[] | undefined) => {
                if (!oldData) return oldData;

                return oldData.map(s =>
                  s.id === unifiedSim.id
                    ? {
                        ...s,
                        dataUsageBytes: enrichedSim.dataUsageBytes,
                        dataAllowanceBytes: enrichedSim.dataAllowanceBytes,
                        dataUsagePercent: enrichedSim.dataUsagePercent,
                        smsCount: enrichedSim.smsCount,
                        callDurationMinutes: enrichedSim.callDurationMinutes,
                        allowedData: enrichedSim.allowedData,
                        remainingData: enrichedSim.remainingData,
                        allowedTime: enrichedSim.allowedTime,
                        remainingTime: enrichedSim.remainingTime,
                        testStateStartDate: enrichedSim.testStateStartDate,
                        isLowData: enrichedSim.dataUsagePercent !== undefined &&
                                   enrichedSim.dataUsagePercent >= DATA_USAGE_THRESHOLDS.WARNING,
                        _enriched: true,
                      }
                    : s
                );
              });

              return true;
            } catch (error) {
              console.error(`Erreur enrichissement ${sim.iccid}:`, error);
              return false;
            }
          });

          await Promise.allSettled(enrichPromises);
          enrichedCount += batch.length;
          setEnrichmentProgress({ current: enrichedCount, total: truphoneSims.length });

          // Petite pause entre les batchs pour éviter de surcharger l'API
          if (i + BATCH_SIZE < truphoneSims.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        console.log(`✅ Enrichissement terminé: ${enrichedCount}/${truphoneSims.length} SIMs`);
        enrichmentDoneRef.current = true;
      } catch (error) {
        console.error("Erreur lors de l'enrichissement progressif:", error);
        enrichmentDoneRef.current = true; // Marquer comme fait même en cas d'erreur
      } finally {
        setIsEnriching(false);
      }
    };

    // DÉSACTIVÉ : l'enrichissement automatique ralentit trop le chargement initial
    // L'utilisateur peut utiliser le bouton "Actualiser" pour enrichir manuellement si besoin
    // const timer = setTimeout(() => {
    //   enrichTruphoneSims();
    // }, 1000);
    // return () => clearTimeout(timer);
  }, [dataUpdatedAt, isLoading]); // allSims et isEnriching exclus volontairement pour éviter les boucles

  // Combiner les SIMs locales avec les résultats de recherche API
  const combinedSims = useMemo(() => {
    // Fusionner sans doublons (utiliser l'ID comme clé unique)
    const simsMap = new Map<string, UnifiedSim>();

    allSims.forEach(sim => simsMap.set(sim.id, sim));
    apiSearchResults.forEach(sim => simsMap.set(sim.id, sim));

    return Array.from(simsMap.values());
  }, [allSims, apiSearchResults]);

  const filteredSims = combinedSims.filter((sim) => {
    // Filtre de recherche texte
    if (searchValue) {
      const search = searchValue.toLowerCase();
      const matchesSearch =
        (sim.msisdn && String(sim.msisdn).toLowerCase().includes(search)) ||
        (sim.iccid && String(sim.iccid).toLowerCase().includes(search)) ||
        (sim.imei && String(sim.imei).toLowerCase().includes(search)) ||
        (sim.provider && String(sim.provider).toLowerCase().includes(search)) ||
        (sim.name && String(sim.name).toLowerCase().includes(search)) ||
        (sim.label && String(sim.label).toLowerCase().includes(search));
      if (!matchesSearch) return false;
    }

    // Filtre opérateur
    if (providerFilter !== "all" && sim.provider !== providerFilter) {
      return false;
    }

    // Filtre statut
    if (statusFilter !== "all") {
      const normalizedStatus = sim.status?.toLowerCase();
      if (statusFilter === "active" && normalizedStatus !== "active" && normalizedStatus !== "activated") {
        return false;
      }
      if (statusFilter === "inactive" && normalizedStatus !== "inactive" && normalizedStatus !== "deactivated" && normalizedStatus !== "not active") {
        return false;
      }
      if (statusFilter === "suspended" && normalizedStatus !== "suspended") {
        return false;
      }
      if (statusFilter === "other" &&
          normalizedStatus !== "active" && normalizedStatus !== "activated" &&
          normalizedStatus !== "inactive" && normalizedStatus !== "deactivated" && normalizedStatus !== "not active" &&
          normalizedStatus !== "suspended") {
        // Afficher les autres statuts
      } else if (statusFilter === "other") {
        return false;
      }
    }

    // Filtre niveau d'alerte données
    if (dataAlertFilter !== "all") {
      const usagePercent = sim.dataUsagePercent;

      if (dataAlertFilter === "ok" && (usagePercent === undefined || usagePercent >= DATA_USAGE_THRESHOLDS.WARNING)) {
        return false;
      }
      if (dataAlertFilter === "warning" && (usagePercent === undefined || usagePercent < DATA_USAGE_THRESHOLDS.WARNING || usagePercent >= DATA_USAGE_THRESHOLDS.CRITICAL)) {
        return false;
      }
      if (dataAlertFilter === "critical" && (usagePercent === undefined || usagePercent < DATA_USAGE_THRESHOLDS.CRITICAL || usagePercent >= DATA_USAGE_THRESHOLDS.DEPLETED)) {
        return false;
      }
      if (dataAlertFilter === "depleted" && (usagePercent === undefined || usagePercent < DATA_USAGE_THRESHOLDS.DEPLETED)) {
        return false;
      }
    }

    return true;
  });

  const columns: Column[] = [
    {
      id: "provider",
      label: "Opérateur",
      sortable: true,
      renderCell: (value: string) => (
        <Badge variant={
          value === "Things Mobile" ? "default" :
          value === "Phenix" ? "secondary" :
          "outline"
        }>
          {value}
        </Badge>
      ),
    },
    { id: "msisdn", label: "MSISDN", sortable: true },
    { id: "iccid", label: "ICCID", sortable: true },
    {
      id: "status",
      label: "Statut",
      sortable: true,
      renderCell: (value: string) => (
        <Badge variant={statusToBadgeVariant(value)}>
          {statusToDisplayText(value)}
        </Badge>
      ),
    },
    {
      id: "dataUsage",
      label: "Data mensuelle (Things Mobile)",
      sortable: true,
      renderCell: (value: string, row: any) => {
        // Pour Things Mobile, afficher la data mensuelle simple
        if (row.provider === "Things Mobile") {
          return value || "—";
        }
        return "—";
      }
    },
    {
      id: "dataUsageDetailed",
      label: "Utilisation data (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        // Pour Truphone, afficher l'utilisation détaillée avec pourcentage
        if (row.provider === "Truphone" && row.dataUsageBytes) {
          const formatted = formatDataUsageWithPercent(
            row.dataUsageBytes,
            row.dataAllowanceBytes,
            row.dataUsagePercent
          );

          // Ajouter un badge coloré si on a un pourcentage
          if (row.dataUsagePercent !== undefined) {
            return (
              <div className="flex items-center gap-2">
                <span>{formatted}</span>
                <Badge variant={getDataUsageBadgeVariant(row.dataUsagePercent)}>
                  {row.dataUsagePercent >= DATA_USAGE_THRESHOLDS.DEPLETED ? "🚨 Critique" :
                   row.dataUsagePercent >= DATA_USAGE_THRESHOLDS.CRITICAL ? "⚠️ Élevé" :
                   row.dataUsagePercent >= DATA_USAGE_THRESHOLDS.WARNING ? "⚡ Attention" :
                   "✅ OK"}
                </Badge>
              </div>
            );
          }
          return formatted;
        }
        return "—";
      }
    },
    {
      id: "smsCount",
      label: "SMS (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.smsCount !== undefined) {
          return row.smsCount.toString();
        }
        return "—";
      }
    },
    {
      id: "callDurationMinutes",
      label: "Appels (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.callDurationMinutes !== undefined) {
          return `${row.callDurationMinutes} min`;
        }
        return "—";
      }
    },
    {
      id: "allowedData",
      label: "Données autorisées (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.allowedData) {
          return row.allowedData;
        }
        return "—";
      }
    },
    {
      id: "remainingData",
      label: "Données restantes (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.remainingData) {
          return row.remainingData;
        }
        return "—";
      }
    },
    {
      id: "allowedTime",
      label: "Temps autorisé (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.allowedTime) {
          return row.allowedTime;
        }
        return "—";
      }
    },
    {
      id: "remainingTime",
      label: "Temps restant (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.remainingTime) {
          return row.remainingTime;
        }
        return "—";
      }
    },
    {
      id: "testStateStartDate",
      label: "Date test (Truphone)",
      sortable: true,
      renderCell: (value: any, row: any) => {
        if (row.provider === "Truphone" && row.testStateStartDate) {
          return row.testStateStartDate;
        }
        return "—";
      }
    },
    { id: "lastConnection", label: "Dernière connexion", sortable: true },
    { id: "name", label: "Nom", sortable: true },
    { id: "tag", label: "Tag", sortable: true },
    { id: "label", label: "Libellé", sortable: true },
    { id: "imei", label: "IMEI", sortable: true },
    { id: "servicePack", label: "Plan tarifaire", sortable: true },
    { id: "organizationName", label: "Organisation", sortable: true },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      renderCell: (value: any, row: any) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedSimForRecharge(row)}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          Recharger
        </Button>
      ),
    },
  ];

  const stats = {
    total: combinedSims.length,
    thingsMobile: combinedSims.filter((s) => s.provider === "Things Mobile").length,
    phenix: combinedSims.filter((s) => s.provider === "Phenix").length,
    truphone: combinedSims.filter((s) => s.provider === "Truphone").length,
  };

  // Calculer les SIMs avec un niveau de data faible
  const lowDataSims = combinedSims.filter(sim => sim.isLowData && sim.dataUsagePercent !== undefined);
  const criticalSims = lowDataSims.filter(sim => sim.dataUsagePercent! >= DATA_USAGE_THRESHOLDS.DEPLETED);
  const warningSims = lowDataSims.filter(sim =>
    sim.dataUsagePercent! >= DATA_USAGE_THRESHOLDS.WARNING &&
    sim.dataUsagePercent! < DATA_USAGE_THRESHOLDS.DEPLETED
  );

  return (
    <div className="space-y-3">
      {/* Barre de progression de l'enrichissement */}
      {isEnriching && enrichmentProgress.total > 0 && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <AlertTitle className="text-sm">Enrichissement en cours...</AlertTitle>
          <AlertDescription>
            <div className="space-y-1">
              <p className="text-xs">
                {enrichmentProgress.current} / {enrichmentProgress.total} SIMs
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(enrichmentProgress.current / enrichmentProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerte pour SIMs presque épuisées - Afficher seulement si critique */}
      {criticalSims.length > 0 && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm">⚠️ {criticalSims.length} SIM(s) critiques</AlertTitle>
          <AlertDescription>
            <p className="text-xs">
              {criticalSims.slice(0, 2).map(sim => sim.iccid).join(", ")}
              {criticalSims.length > 2 && ` +${criticalSims.length - 2} autre(s)`}
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Cartes SIM (3 Opérateurs)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Things Mobile, Phenix et Truphone
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search Bar avec indicateur de recherche API */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                placeholder="Rechercher par MSISDN, ICCID, IMEI..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-9"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            {apiSearchResults.length > 0 && (
              <Badge variant="outline" className="text-xs">
                +{apiSearchResults.length} via API
              </Badge>
            )}
          </div>

          {/* Warning for partial data - Compact */}
          {providerStatuses.some((p) => p.status === "error") && !isLoading && (
            <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
              <AlertTitle className="text-sm">Données partielles</AlertTitle>
              <AlertDescription>
                <p className="text-xs">
                  {providerStatuses
                    .filter((p) => p.status === "error")
                    .map((p) => `${p.provider}`)
                    .join(", ")} indisponible(s)
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Filtres - Compact */}
          <div className="grid gap-2 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Opérateur</label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Things Mobile">Things Mobile</SelectItem>
                  <SelectItem value="Phenix">Phenix</SelectItem>
                  <SelectItem value="Truphone">Truphone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Niveau d'alerte</label>
              <Select value={dataAlertFilter} onValueChange={setDataAlertFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="ok">✅ OK</SelectItem>
                  <SelectItem value="warning">⚡ Attention</SelectItem>
                  <SelectItem value="critical">⚠️ Critique</SelectItem>
                  <SelectItem value="depleted">🚨 Épuisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProviderFilter("all");
                  setStatusFilter("all");
                  setDataAlertFilter("all");
                  setSearchValue("");
                }}
                className="w-full h-9"
              >
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Data Table avec virtualisation pour performance */}
          <div className="rounded-lg border bg-card overflow-x-auto">
            <EnhancedDataTable
              data={filteredSims}
              columns={columns}
              loading={isLoading}
              enablePagination={false}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredSims.length} SIM(s) affichée(s) sur {combinedSims.length} au total • Virtualisation activée
          </p>

          {!isLoading && filteredSims.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">Aucune carte SIM trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de recharge */}
      <RechargeSimDialog
        open={selectedSimForRecharge !== null}
        onOpenChange={(open) => !open && setSelectedSimForRecharge(null)}
        sim={selectedSimForRecharge}
        onSuccess={() => {
          refetch();
          toast({
            title: "Recharge terminée",
            description: "La SIM a été rechargée avec succès",
          });
        }}
      />
    </div>
  );
}
