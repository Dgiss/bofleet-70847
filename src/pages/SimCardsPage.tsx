
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimTab } from "@/components/sim/SimTab";
import SimCardManagement from "@/components/sim/SimCardManagement";

export default function SimCardsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Cartes SIM</h1>
      <Tabs defaultValue="live">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="live">Things Mobile (temps réel)</TabsTrigger>
          <TabsTrigger value="analytics">Tableau analytique (données simulées)</TabsTrigger>
        </TabsList>
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
