
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { SimCardTable } from "./SimCardTable";
import { SimCardChart } from "./SimCardChart";
import { SimCardFilters } from "./SimCardFilters";
import { generateSimCardData, SimCard, checkAndUpdateExpiredStatus, getExpirationReason } from "./sim-data-utils";

export default function SimCardManagement() {
  // Generate initial data
  const [simCards, setSimCards] = useState<SimCard[]>(generateSimCardData());
  const [viewType, setViewType] = useState<"table" | "chart">("table");
  const { toast } = useToast();
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("month");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Check for expired cards periodically
  useEffect(() => {
    const checkExpiredCards = () => {
      setSimCards(prev => {
        const updated = checkAndUpdateExpiredStatus(prev);
        const newExpiredCards = updated.filter((card, index) => 
          card.status === "expired" && prev[index].status !== "expired"
        );
        
        if (newExpiredCards.length > 0) {
          // Group expired cards by expiration reason
          const byReason = newExpiredCards.reduce((acc, card) => {
            const reason = getExpirationReason(card);
            if (!acc[reason]) acc[reason] = [];
            acc[reason].push(card);
            return acc;
          }, {} as Record<string, SimCard[]>);

          // Show different notifications based on expiration reason
          Object.entries(byReason).forEach(([reason, cards]) => {
            toast({
              title: "Cartes expirées détectées",
              description: `${cards.length} carte(s) : ${reason}`,
              variant: "destructive",
            });
          });
        }
        
        return updated;
      });
    };

    checkExpiredCards();
    const interval = setInterval(checkExpiredCards, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [toast]);
  
  // Apply filters to data
  const filteredData = simCards.filter((card) => {
    // Filter by type
    if (typeFilter !== "all" && card.type !== typeFilter) return false;
    
    // Filter by status
    if (statusFilter !== "all" && card.status !== statusFilter) return false;
    
    // Filter by search term
    if (searchTerm && !card.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  // Handle status change (simulated)
  const handleStatusChange = (simId: string, newStatus: "active" | "suspended" | "blocked" | "recharging" | "expired") => {
    setSimCards(prev => 
      prev.map(card => 
        card.id === simId ? { ...card, status: newStatus } : card
      )
    );
    
    toast({
      title: "Statut mis à jour",
      description: `Le statut de la carte SIM ${simId} a été modifié.`,
    });
  };

  // Handle recharge action
  const handleRecharge = (simId: string) => {
    // Set status to recharging
    setSimCards(prev => 
      prev.map(card => 
        card.id === simId ? { 
          ...card, 
          status: "recharging" as const,
          rechargePending: true 
        } : card
      )
    );

    toast({
      title: "Recharge initiée",
      description: `La recharge de la carte SIM ${simId} a été déclenchée.`,
    });

    // Simulate recharge process (3 seconds)
    setTimeout(() => {
      setSimCards(prev => 
        prev.map(card => 
          card.id === simId ? {
            ...card,
            status: "active" as const,
            rechargePending: false,
            dataUsage: 0,
            smsCount: 0,
            callDuration: 0,
            lastRechargeDate: new Date(),
            lastActivity: new Date(),
            // Note: For date expiration, recharge won't extend the 5-year limit
            // Only credit limits are reset
          } : card
        )
      );

      toast({
        title: "Recharge terminée",
        description: `La carte SIM ${simId} a été rechargée avec succès.`,
      });
    }, 3000);
  };

  // Handle cancel recharge
  const handleCancelRecharge = (simId: string) => {
    setSimCards(prev => 
      prev.map(card => 
        card.id === simId ? { 
          ...card, 
          status: "active" as const,
          rechargePending: false 
        } : card
      )
    );

    toast({
      title: "Recharge annulée",
      description: `La recharge de la carte SIM ${simId} a été annulée.`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Cartes SIM</h1>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Analyse de la Consommation</CardTitle>
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as "table" | "chart")} className="w-56">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="table">Tableau</TabsTrigger>
                <TabsTrigger value="chart">Graphique</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <SimCardFilters 
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            periodFilter={periodFilter}
            setPeriodFilter={setPeriodFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          
          {viewType === "table" ? (
            <SimCardTable 
              data={filteredData} 
              period={periodFilter}
              onStatusChange={handleStatusChange}
              onRecharge={handleRecharge}
              onCancelRecharge={handleCancelRecharge}
            />
          ) : (
            <SimCardChart 
              data={filteredData} 
              period={periodFilter}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
