
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, Car, Cpu } from "lucide-react";

export default function Index() {
  const stats = [
    {
      title: "Entreprises & Utilisateurs",
      value: "70",
      description: "Entreprises et utilisateurs enregistrés",
      icon: Building2,
      path: "/entreprises",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Véhicules",
      value: "142",
      description: "Véhicules suivis",
      icon: Car,
      path: "/vehicules-boitiers",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Boîtiers",
      value: "156",
      description: "Boîtiers installés",
      icon: Cpu,
      path: "/vehicules-boitiers",
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Link to={stat.path} key={index}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions effectuées dans le système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm">Nouveau véhicule ajouté: GH-968-ZX</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">Nouvel utilisateur: abnettoyage</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-sm">Mise à jour boîtier: 862531040673056</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm">Nouvelle entreprise: IRIS MULTISERVICES</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques d'utilisation</CardTitle>
            <CardDescription>Utilisation du système par jour</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Graphique de statistiques</p>
              <p className="text-xs">Les données seront affichées ici</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
