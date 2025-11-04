import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listTruphoneSims } from "@/services/TruphoneService";

export default function TruphoneTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTruphone = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const apiKey = import.meta.env.VITE_TRUPHONE_API_KEY;

    console.log("=== TEST TRUPHONE API ==={");
    console.log("API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "❌ Non configuré");
    console.log("URL:", "/api/truphone/api/v2.2/sims");

    try {
      const sims = await listTruphoneSims();

      console.log("SUCCESS - Nombre de SIMs:", sims.length);
      console.log("SUCCESS - Données:", sims);

      setResult({
        success: true,
        count: sims.length,
        sims: sims,
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
          <CardTitle>Test API Truphone</CardTitle>
          <CardDescription>
            Diagnostic détaillé de l'API Truphone (v2.2)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded text-sm">
              <h3 className="font-semibold mb-2">Configuration :</h3>
              <p>
                <strong>API Key:</strong>{" "}
                {import.meta.env.VITE_TRUPHONE_API_KEY
                  ? `${import.meta.env.VITE_TRUPHONE_API_KEY.substring(0, 10)}... ✅`
                  : "❌ Non configuré"}
              </p>
              <p>
                <strong>Base URL:</strong> https://iot.truphone.com/api
              </p>
              <p>
                <strong>Endpoint:</strong> /api/v2.2/sims
              </p>
              <p>
                <strong>Auth Header:</strong> Token [api_key]
              </p>
            </div>

            <Button onClick={testTruphone} disabled={loading} className="w-full">
              {loading ? "Test en cours..." : "Tester l'API Truphone"}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-semibold text-red-800 mb-2">Erreur</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className={`p-4 border rounded ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.success ? "✅ Succès" : "❌ Échec"}
                </h3>
                <div className="space-y-2 text-sm">
                  {result.success && (
                    <>
                      <p>
                        <strong>Nombre de SIMs:</strong> {result.count}
                      </p>
                      {result.count > 0 && (
                        <div className="mt-2">
                          <strong>Première SIM:</strong>
                          <pre className="mt-1 p-2 bg-white rounded text-xs">
                            {JSON.stringify(result.sims[0], null, 2)}
                          </pre>
                        </div>
                      )}
                    </>
                  )}

                  {!result.success && (
                    <>
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
                    </>
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

            <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm">
              <h3 className="font-semibold text-blue-900 mb-2">
                Informations de configuration :
              </h3>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Base URL changée: api.truphone.com → iot.truphone.com</li>
                <li>Version API: v2.2 (selon documentation OpenAPI)</li>
                <li>Authentication: Token (pas Bearer)</li>
                <li>Proxy Vite configuré pour éviter les erreurs CORS</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Instructions :
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-yellow-800">
                <li>Ouvrez la console du navigateur (F12)</li>
                <li>Cliquez sur "Tester l'API Truphone"</li>
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
