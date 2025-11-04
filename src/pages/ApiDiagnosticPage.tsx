import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { listThingsMobileSims } from "@/services/ThingsMobileService";
import { listPhenixSims } from "@/services/PhenixService";
import { listTruphoneSims } from "@/services/TruphoneService";

type ApiStatus = "idle" | "loading" | "success" | "error";

interface ApiResult {
  status: ApiStatus;
  message?: string;
  count?: number;
  error?: string;
}

export default function ApiDiagnosticPage() {
  const [thingsMobileResult, setThingsMobileResult] = useState<ApiResult>({ status: "idle" });
  const [phenixResult, setPhenixResult] = useState<ApiResult>({ status: "idle" });
  const [truphoneResult, setTruphoneResult] = useState<ApiResult>({ status: "idle" });

  const testThingsMobile = async () => {
    setThingsMobileResult({ status: "loading" });
    try {
      const result = await listThingsMobileSims({ pageSize: 10 });
      setThingsMobileResult({
        status: "success",
        message: "Connexion réussie",
        count: result.sims.length,
      });
    } catch (error: any) {
      setThingsMobileResult({
        status: "error",
        error: error.message || "Erreur de connexion",
      });
    }
  };

  const testPhenix = async () => {
    setPhenixResult({ status: "loading" });
    try {
      console.log("=== Test Phenix démarré ===");
      const result = await listPhenixSims();
      setPhenixResult({
        status: "success",
        message: "Connexion réussie",
        count: result.length,
      });
    } catch (error: any) {
      console.error("=== Erreur Test Phenix ===", error);
      setPhenixResult({
        status: "error",
        error: error.message || "Erreur de connexion (vérifiez vos credentials)",
      });
    }
  };

  const testTruphone = async () => {
    setTruphoneResult({ status: "loading" });
    try {
      console.log("=== Test Truphone démarré ===");
      const result = await listTruphoneSims();
      setTruphoneResult({
        status: "success",
        message: "Connexion réussie",
        count: result.length,
      });
    } catch (error: any) {
      console.error("=== Erreur Test Truphone ===", error);
      setTruphoneResult({
        status: "error",
        error: error.message || "Erreur de connexion",
      });
    }
  };

  const testAll = async () => {
    await Promise.all([
      testThingsMobile(),
      testPhenix(),
      testTruphone(),
    ]);
  };

  const getStatusIcon = (status: ApiStatus) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  const renderResult = (result: ApiResult) => {
    if (result.status === "idle") {
      return <p className="text-sm text-gray-500">Cliquez sur "Tester" pour vérifier la connexion</p>;
    }
    if (result.status === "loading") {
      return <p className="text-sm text-blue-600">Test en cours...</p>;
    }
    if (result.status === "success") {
      return (
        <div className="text-sm">
          <p className="text-green-600 font-medium">{result.message}</p>
          <p className="text-gray-600 mt-1">
            {result.count !== undefined && `${result.count} SIM(s) trouvée(s)`}
          </p>
        </div>
      );
    }
    if (result.status === "error") {
      return (
        <div className="text-sm">
          <p className="text-red-600 font-medium">Échec de la connexion</p>
          <p className="text-red-500 text-xs mt-1">{result.error}</p>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Diagnostic des APIs IoT</h1>
        <p className="text-gray-600">
          Testez la connectivité avec les différentes APIs de gestion de cartes SIM
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={testAll} size="lg" className="w-full sm:w-auto">
          Tester toutes les APIs
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Things Mobile */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(thingsMobileResult.status)}
                <div>
                  <CardTitle>Things Mobile API</CardTitle>
                  <CardDescription>https://api.thingsmobile.com</CardDescription>
                </div>
              </div>
              <Button onClick={testThingsMobile} variant="outline" size="sm">
                Tester
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderResult(thingsMobileResult)}
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
              <p className="font-semibold mb-1">Configuration :</p>
              <p>Username: {import.meta.env.VITE_THINGSMOBILE_USERNAME || "❌ Non configuré"}</p>
              <p>Token: {import.meta.env.VITE_THINGSMOBILE_TOKEN ? "✅ Configuré" : "❌ Non configuré"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Phenix */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(phenixResult.status)}
                <div>
                  <CardTitle>Phenix API</CardTitle>
                  <CardDescription>https://api.phenix-partner.fr</CardDescription>
                </div>
              </div>
              <Button onClick={testPhenix} variant="outline" size="sm">
                Tester
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderResult(phenixResult)}
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
              <p className="font-semibold mb-1">Configuration :</p>
              <p>Username: {import.meta.env.VITE_PHENIX_USERNAME || "❌ Non configuré"}</p>
              <p>Password: {import.meta.env.VITE_PHENIX_PASSWORD ? "✅ Configuré" : "❌ Non configuré"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Truphone */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(truphoneResult.status)}
                <div>
                  <CardTitle>Truphone API</CardTitle>
                  <CardDescription>https://api.truphone.com</CardDescription>
                </div>
              </div>
              <Button onClick={testTruphone} variant="outline" size="sm">
                Tester
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderResult(truphoneResult)}
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
              <p className="font-semibold mb-1">Configuration :</p>
              <p>API Key: {import.meta.env.VITE_TRUPHONE_API_KEY ? "✅ Configuré" : "❌ Non configuré"}</p>
              <p>Password: {import.meta.env.VITE_TRUPHONE_PASSWORD ? "✅ Configuré" : "❌ Non configuré"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Notes importantes
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Assurez-vous d'avoir redémarré le serveur après avoir modifié le fichier .env</li>
          <li>Vérifiez que les credentials sont corrects dans votre fichier .env</li>
          <li>Les APIs Phenix et Truphone sont optionnelles, seule Things Mobile est requise</li>
          <li>En cas d'erreur CORS, vérifiez la configuration du proxy dans vite.config.ts</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Erreurs courantes
        </h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <div>
            <strong>401 Unauthorized (Phenix) :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Vérifiez que vos credentials Phenix sont corrects</li>
              <li>Vérifiez que l'endpoint d'authentification est le bon</li>
              <li>Consultez la console du navigateur (F12) pour plus de détails</li>
            </ul>
          </div>
          <div>
            <strong>404 Not Found (Truphone) :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>L'URL de l'API Truphone utilisée est basée sur des suppositions</li>
              <li>Contactez Truphone pour obtenir la documentation exacte de leur API</li>
              <li>Les endpoints réels peuvent être différents de ceux utilisés ici</li>
            </ul>
          </div>
          <div className="mt-3 p-2 bg-white rounded">
            <strong>🔍 Débogage :</strong>
            <p className="mt-1">Ouvrez la console du navigateur (F12 → Console) pour voir les logs détaillés des tentatives de connexion.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
