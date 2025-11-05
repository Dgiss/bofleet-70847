
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimTab } from "@/components/sim/SimTab";
import { MultiProviderSimTab } from "@/components/sim/MultiProviderSimTab";
import SimCardManagement from "@/components/sim/SimCardManagement";

export default function SimCardsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Cartes SIM</h1>
      <Tabs defaultValue="all">
        <TabsList className="w-full sm:w-auto grid grid-cols-3">
          <TabsTrigger value="all">🌐 Tous les opérateurs</TabsTrigger>
          <TabsTrigger value="live">📡 Things Mobile</TabsTrigger>
          <TabsTrigger value="analytics">📊 Simulation</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-4">
          <MultiProviderSimTab />
        </TabsContent>
        <TabsContent value="live" className="pt-4">
          <SimTab />
        </TabsContent>
        <TabsContent value="analytics" className="pt-4">
          <SimCardManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
