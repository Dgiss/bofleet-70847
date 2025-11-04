
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SimCard } from "./sim-data-utils";

interface SimCardChartProps {
  data: SimCard[];
  period: string;
}

export function SimCardChart({ data, period }: SimCardChartProps) {
  // Prepare data for the chart
  const chartData = data.map(sim => ({
    name: sim.id.slice(-4), // Last 4 digits of ID for better display
    "Données (%)": Math.round((sim.dataUsage / sim.dataPlan) * 100),
    "SMS (%)": Math.round((sim.smsCount / sim.smsPlan) * 100),
    "Appels (%)": Math.round((sim.callDuration / sim.callPlan) * 100),
    type: sim.type,
    fullId: sim.id
  }));

  return (
    <div className="w-full h-[500px]">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 70,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Consommation (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [`${value}%`, name]}
              labelFormatter={(label) => {
                // Find the full ID for this label
                const simData = chartData.find(item => item.name === label);
                return simData ? `ID: ${simData.fullId} (${simData.type})` : label;
              }}
            />
            <Legend />
            <Bar dataKey="Données (%)" fill="#3b82f6" />
            <Bar dataKey="SMS (%)" fill="#8b5cf6" />
            <Bar dataKey="Appels (%)" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Aucune donnée disponible pour l'affichage graphique
        </div>
      )}
    </div>
  );
}
