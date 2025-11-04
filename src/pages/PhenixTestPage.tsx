import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

export default function PhenixTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const username = import.meta.env.VITE_PHENIX_USERNAME;
    const password = import.meta.env.VITE_PHENIX_PASSWORD;

    console.log("=== TEST AUTHENTIFICATION PHENIX ===");
    console.log("Username:", username);
    console.log("URL:", "/api/phenix/Auth/authenticate");

    try {
      const response = await axios.post(
        "/api/phenix/Auth/authenticate",
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("SUCCESS - Status:", response.status);
      console.log("SUCCESS - Data:", response.data);
      console.log("SUCCESS - Headers:", response.headers);

      setResult({
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
    } catch (err: any) {
      console.error("ERROR - Message:", err.message);
      console.error("ERROR - Response:", err.response);
      console.error("ERROR - Status:", err.response?.status);
      console.error("ERROR - Data:", err.response?.data);

      setError(err.message);
      setResult({
        success: false,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Authentification Phenix</CardTitle>
          <CardDescription>
            Diagnostic détaillé de l'authentification Phenix API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded text-sm">
              <h3 className="font-semibold mb-2">Configuration :</h3>
              <p>
                <strong>Username:</strong>{" "}
                {import.meta.env.VITE_PHENIX_USERNAME || "❌ Non configuré"}
              </p>
              <p>
                <strong>Password:</strong>{" "}
                {import.meta.env.VITE_PHENIX_PASSWORD ? "✅ Configuré" : "❌ Non configuré"}
              </p>
              <p>
                <strong>URL:</strong> /api/phenix/Auth/authenticate
              </p>
            </div>

            <Button onClick={testAuth} disabled={loading} className="w-full">
              {loading ? "Test en cours..." : "Tester l'authentification"}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Erreur</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {result.success ? "✅ Succès" : "❌ Échec"}
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Status HTTP:</strong> {result.status}
                  </p>
                  {result.statusText && (
                    <p>
                      <strong>Status Text:</strong> {result.statusText}
                    </p>
                  )}
                  {result.message && (
                    <p>
                      <strong>Message:</strong> {result.message}
                    </p>
                  )}

                  <div className="mt-4">
                    <strong>Réponse complète :</strong>
                    <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Instructions :
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-yellow-800">
                <li>Ouvrez la console du navigateur (F12)</li>
                <li>Cliquez sur "Tester l'authentification"</li>
                <li>Regardez les logs détaillés dans la console</li>
                <li>Vérifiez la réponse complète ci-dessus</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
