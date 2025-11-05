import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { rechargePhenixSim } from "@/services/PhenixService";

export default function RechargeTestPage() {
  const [provider, setProvider] = useState<string>("Phenix");
  const [msisdn, setMsisdn] = useState("");
  const [iccid, setIccid] = useState("");
  const [volume, setVolume] = useState("100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const volumeNum = parseInt(volume);
    if (isNaN(volumeNum) || volumeNum <= 0) {
      setError("Volume invalide");
      setLoading(false);
      return;
    }

    console.log("=== TEST RECHARGE ===");
    console.log("Opérateur:", provider);
    console.log("MSISDN:", msisdn);
    console.log("ICCID:", iccid);
    console.log("Volume:", volumeNum, "MB");

    try {
      let success = false;
      let message = "";

      switch (provider) {
        case "Phenix":
          if (!msisdn) {
            throw new Error("MSISDN requis pour Phenix");
          }
          console.log("🔄 Appel API Phenix...");
          success = await rechargePhenixSim(msisdn, volumeNum);
          message = success ? "Recharge Phenix réussie" : "Recharge Phenix échouée";
          break;

        case "Things Mobile":
          if (!msisdn) {
            throw new Error("MSISDN requis pour Things Mobile");
          }
          console.log("🔄 Simulation Things Mobile...");
          // Things Mobile n'a pas d'API de recharge publique
          await new Promise((resolve) => setTimeout(resolve, 2000));
          success = true;
          message = "Recharge Things Mobile simulée (API non disponible)";
          break;

        case "Truphone":
          if (!iccid) {
            throw new Error("ICCID requis pour Truphone");
          }
          console.log("🔄 Simulation Truphone...");
          // Truphone: simulation
          await new Promise((resolve) => setTimeout(resolve, 2000));
          success = true;
          message = "Recharge Truphone simulée (API non disponible)";
          break;

        default:
          throw new Error("Opérateur non supporté");
      }

      console.log("✅ Résultat:", success, message);
      setResult({
        success,
        message,
        provider,
        msisdn: msisdn || "—",
        iccid: iccid || "—",
        volume: volumeNum,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("❌ Erreur:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erreur inconnue";
      setError(errorMessage);
      setResult({
        success: false,
        message: errorMessage,
        provider,
        msisdn: msisdn || "—",
        iccid: iccid || "—",
        volume: volumeNum,
        timestamp: new Date().toISOString(),
        errorDetails: {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Test de Recharge SIM
          </h1>
          <p className="text-muted-foreground mt-2">
            Testez les fonctionnalités de recharge pour les différents opérateurs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration du test</CardTitle>
            <CardDescription>
              Sélectionnez l'opérateur et saisissez les informations de la SIM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Opérateur */}
            <div className="space-y-2">
              <Label htmlFor="provider">Opérateur</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phenix">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Phenix</Badge>
                      <span className="text-xs text-muted-foreground">(Recharge réelle)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Things Mobile">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Things Mobile</Badge>
                      <span className="text-xs text-muted-foreground">(Simulation)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Truphone">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Truphone</Badge>
                      <span className="text-xs text-muted-foreground">(Simulation)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MSISDN */}
            <div className="space-y-2">
              <Label htmlFor="msisdn">
                MSISDN (numéro de téléphone)
                {(provider === "Phenix" || provider === "Things Mobile") && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Input
                id="msisdn"
                placeholder="Ex: 33612345678"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Requis pour Phenix et Things Mobile
              </p>
            </div>

            {/* ICCID */}
            <div className="space-y-2">
              <Label htmlFor="iccid">
                ICCID (identifiant carte)
                {provider === "Truphone" && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="iccid"
                placeholder="Ex: 89331012345678901234"
                value={iccid}
                onChange={(e) => setIccid(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Requis pour Truphone</p>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label htmlFor="volume">Volume à recharger (MB)</Label>
              <Input
                id="volume"
                type="number"
                placeholder="100"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                min="1"
                disabled={loading}
              />
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 5000].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setVolume(String(preset))}
                    disabled={loading}
                  >
                    {preset} MB
                  </Button>
                ))}
              </div>
            </div>

            {/* Avertissements */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Information importante</AlertTitle>
              <AlertDescription className="space-y-1 text-xs">
                {provider === "Phenix" && (
                  <>
                    <p>
                      <strong>Phenix:</strong> Utilise l'API réelle{" "}
                      <code className="bg-muted px-1">/GsmApi/V2/MsisdnAddDataRecharge</code>
                    </p>
                    <p className="text-yellow-600">
                      ⚠️ Erreur 403 possible si les permissions API ne sont pas activées
                    </p>
                  </>
                )}
                {provider === "Things Mobile" && (
                  <p>
                    <strong>Things Mobile:</strong> Simulation uniquement. L'API Things Mobile ne
                    fournit pas d'endpoint public de recharge.
                  </p>
                )}
                {provider === "Truphone" && (
                  <p>
                    <strong>Truphone:</strong> Simulation uniquement. Vérifier la documentation
                    Truphone pour l'endpoint de recharge réel.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            {/* Bouton de test */}
            <Button onClick={handleTest} disabled={loading} className="w-full" size="lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lancer le test de recharge
            </Button>
          </CardContent>
        </Card>

        {/* Résultats */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Test réussi
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    Test échoué
                  </>
                )}
              </CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Détails */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-sm">
                  <div>
                    <p className="text-muted-foreground">Opérateur</p>
                    <p className="font-medium">{result.provider}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-medium">{result.volume} MB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">MSISDN</p>
                    <p className="font-medium">{result.msisdn}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ICCID</p>
                    <p className="font-medium">{result.iccid}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Timestamp</p>
                    <p className="font-medium text-xs">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Détails d'erreur */}
                {result.errorDetails && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-red-600">Détails de l'erreur :</p>
                    <pre className="p-4 bg-red-50 dark:bg-red-950 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(result.errorDetails, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Réponse complète */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Réponse complète :</p>
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Erreur */}
        {error && !result && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Ouvrez la console du navigateur (F12) pour voir les logs détaillés</li>
              <li>Sélectionnez l'opérateur à tester</li>
              <li>Saisissez le MSISDN ou ICCID selon l'opérateur</li>
              <li>Choisissez le volume à recharger</li>
              <li>Cliquez sur "Lancer le test"</li>
              <li>Vérifiez le résultat ci-dessus et dans la console</li>
            </ol>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                État des APIs de recharge :
              </p>
              <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
                <li>
                  ✅ <strong>Phenix:</strong> API réelle (erreur 403 si permissions manquantes)
                </li>
                <li>
                  ⚠️ <strong>Things Mobile:</strong> Simulation (pas d'API publique)
                </li>
                <li>
                  ⚠️ <strong>Truphone:</strong> Simulation (à vérifier dans la doc)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
