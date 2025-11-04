import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Filter, Calendar, BarChart, Loader2 } from "lucide-react";
import {
  listThingsMobileSims,
  type ThingsMobileSim
} from "@/services/ThingsMobileService";
import {
  listPhenixSims,
  getPhenixConsumptionHistory,
  type PhenixSim
} from "@/services/PhenixService";
import {
  listTruphoneSims,
  getTruphoneUsage,
  type TruphoneSim
} from "@/services/TruphoneService";

// Types de cartes SIM
type SimType = "Truphone" | "Things Mobile" | "Phenix" | "All";

// Périodes possibles
type Period = "day" | "week" | "month";

// Structure des données de consommation
interface SimConsumption {
  id: string;
  type: "Truphone" | "Things Mobile" | "Phenix";
  dataUsage: number; // en MB
  smsCount: number;
  callDuration: number; // en minutes
}

// Seuils de consommation pour la coloration
const thresholds = {
  data: { low: 100, medium: 500 }, // en MB
  sms: { low: 20, medium: 50 },
  calls: { low: 30, medium: 120 } // en minutes
};

// Fonction pour convertir bytes en MB
const bytesToMB = (bytes: number): number => {
  return Math.round(bytes / 1000000);
};

// Fonction pour récupérer les données réelles des APIs
const fetchSimConsumptionData = async (): Promise<SimConsumption[]> => {
  const data: SimConsumption[] = [];

  try {
    // Récupérer les SIMs Things Mobile
    const thingsMobileSims = await listThingsMobileSims({ pageSize: 100 });
    thingsMobileSims.sims.forEach((sim) => {
      data.push({
        id: sim.iccid || sim.msisdn,
        type: "Things Mobile",
        dataUsage: bytesToMB(sim.monthlyTrafficBytes || sim.dailyTrafficBytes || 0),
        smsCount: 0, // Things Mobile ne fournit pas de données SMS dans simListLite
        callDuration: 0, // Things Mobile ne fournit pas de données d'appels
      });
    });
  } catch (error) {
    console.log("Things Mobile SIMs not available:", error);
  }

  try {
    // Récupérer les SIMs Phenix (si credentials disponibles)
    const phenixSims = await listPhenixSims();
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    for (const sim of phenixSims) {
      try {
        const consumption = await getPhenixConsumptionHistory(sim.msisdn, month, year);
        data.push({
          id: sim.iccid || sim.msisdn,
          type: "Phenix",
          dataUsage: bytesToMB(consumption?.data || 0),
          smsCount: consumption?.sms || 0,
          callDuration: consumption?.voice || 0,
        });
      } catch (error) {
        console.log(`Error fetching Phenix consumption for ${sim.msisdn}:`, error);
      }
    }
  } catch (error) {
    console.log("Phenix SIMs not available:", error);
  }

  try {
    // Récupérer les SIMs Truphone (si credentials disponibles)
    const truphoneSims = await listTruphoneSims();

    for (const sim of truphoneSims) {
      try {
        const usage = await getTruphoneUsage(sim.simId);
        data.push({
          id: sim.iccid || sim.simId,
          type: "Truphone",
          dataUsage: bytesToMB(usage?.dataUsage || 0),
          smsCount: usage?.smsCount || 0,
          callDuration: usage?.callDuration || 0,
        });
      } catch (error) {
        console.log(`Error fetching Truphone usage for ${sim.simId}:`, error);
      }
    }
  } catch (error) {
    console.log("Truphone SIMs not available:", error);
  }

  return data;
};

// Fonction pour déterminer la couleur en fonction du seuil
const getColorByThreshold = (value: number, type: 'data' | 'sms' | 'calls'): string => {
  const { low, medium } = thresholds[type];
  if (value < low) return "bg-green-100 text-green-800";
  if (value < medium) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

// Fonction pour déterminer la couleur de la barre de progression
const getProgressColor = (value: number, type: 'data' | 'sms' | 'calls'): string => {
  const { low, medium } = thresholds[type];
  if (value < low) return "bg-green-500";
  if (value < medium) return "bg-yellow-500";
  return "bg-red-500";
};

// Composant principal
export const SimConsumptionTable: React.FC = () => {
  const [simTypeFilter, setSimTypeFilter] = useState<SimType>("All");
  const [period, setPeriod] = useState<Period>("month");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Charger les données des SIMs via React Query
  const { data: simData = [], isLoading, error } = useQuery({
    queryKey: ["simConsumption", period],
    queryFn: fetchSimConsumptionData,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
    retry: 1,
  });

  // Filtrer les données selon le type de SIM et le terme de recherche
  const filteredData = simData.filter((sim) =>
    (simTypeFilter === "All" || sim.type === simTypeFilter) &&
    sim.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir le maximum pour chaque type de consommation pour calculer les pourcentages
  const maxData = simData.length > 0 ? Math.max(...simData.map((sim) => sim.dataUsage), 1) : 1;
  const maxSms = simData.length > 0 ? Math.max(...simData.map((sim) => sim.smsCount), 1) : 1;
  const maxCalls = simData.length > 0 ? Math.max(...simData.map((sim) => sim.callDuration), 1) : 1;
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Chargement des données de consommation...</span>
      </div>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600">
          Impossible de charger les données de consommation. Vérifiez vos credentials API.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Consommation des Cartes SIM (Données réelles)</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Select value={simTypeFilter} onValueChange={(value) => setSimTypeFilter(value as SimType)}>
              <SelectTrigger className="pl-8 w-full sm:w-40">
                <SelectValue placeholder="Type de SIM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tous</SelectItem>
                <SelectItem value="Truphone">Truphone</SelectItem>
                <SelectItem value="Things Mobile">Things Mobile</SelectItem>
                <SelectItem value="Phenix">Phenix</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
              <SelectTrigger className="pl-8 w-full sm:w-40">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Jour</SelectItem>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Input
              type="search"
              placeholder="Rechercher par ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">ID Carte SIM</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="min-w-[200px]">
                <div className="flex items-center">
                  <BarChart className="h-4 w-4 mr-1" /> 
                  Données (MB)
                </div>
              </TableHead>
              <TableHead className="min-w-[200px]">SMS</TableHead>
              <TableHead className="min-w-[200px]">Appels (min)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((sim) => (
                <TableRow key={sim.id}>
                  <TableCell className="font-medium">{sim.id}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${sim.type === "Truphone" ? "bg-blue-100 text-blue-800" : 
                        sim.type === "Things Mobile" ? "bg-purple-100 text-purple-800" : 
                        "bg-indigo-100 text-indigo-800"}`
                    }>
                      {sim.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded mb-1 text-sm ${getColorByThreshold(sim.dataUsage, 'data')}`}>
                      {sim.dataUsage} MB
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getProgressColor(sim.dataUsage, 'data')}`}
                        style={{ width: `${(sim.dataUsage / maxData) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded mb-1 text-sm ${getColorByThreshold(sim.smsCount, 'sms')}`}>
                      {sim.smsCount} messages
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getProgressColor(sim.smsCount, 'sms')}`}
                        style={{ width: `${(sim.smsCount / maxSms) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded mb-1 text-sm ${getColorByThreshold(sim.callDuration, 'calls')}`}>
                      {sim.callDuration} minutes
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getProgressColor(sim.callDuration, 'calls')}`}
                        style={{ width: `${(sim.callDuration / maxCalls) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Aucune donnée disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Légende - Données</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
              <span>Faible (&lt; {thresholds.data.low} MB)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
              <span>Moyen ({thresholds.data.low} - {thresholds.data.medium} MB)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
              <span>Élevé (&gt; {thresholds.data.medium} MB)</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Légende - SMS</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
              <span>Faible (&lt; {thresholds.sms.low})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
              <span>Moyen ({thresholds.sms.low} - {thresholds.sms.medium})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
              <span>Élevé (&gt; {thresholds.sms.medium})</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Légende - Appels</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
              <span>Faible (&lt; {thresholds.calls.low} min)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
              <span>Moyen ({thresholds.calls.low} - {thresholds.calls.medium} min)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
              <span>Élevé (&gt; {thresholds.calls.medium} min)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
