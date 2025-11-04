import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface DiagnosticResult {
  imei: string;
  timestamp: string;
  tests: Array<{
    name: string;
    success: boolean;
    data: any;
    error: string | null;
    count?: number;
    totalDevicesScanned?: number;
    cacheSize?: number;
    cacheAge?: number;
  }>;
}

interface ImeiDiagnosticPanelProps {
  className?: string;
}

export const ImeiDiagnosticPanel: React.FC<ImeiDiagnosticPanelProps> = ({ className }) => {
  const [targetImei, setTargetImei] = useState('350612071728933');
  const [isRunning, setIsRunning] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticResult | null>(null);

  const runDiagnostic = async () => {
    if (!targetImei.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un IMEI",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    try {
      console.log('🔍 Launching diagnostic for IMEI:', targetImei);
      
      const { ImeiDiagnosticService } = await import('../../services/ImeiDiagnosticService.js');
      const results = await ImeiDiagnosticService.runFullDiagnostic(targetImei.trim());
      
      setLastDiagnostic(results);
      
      const successCount = results.tests.filter(test => test.success).length;
      toast({
        title: "Diagnostic terminé",
        description: `${successCount}/${results.tests.length} tests réussis`,
        variant: successCount > 0 ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast({
        title: "Erreur diagnostic",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const forceSync = async () => {
    if (!targetImei.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un IMEI",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    try {
      console.log('🔄 Forcing sync for IMEI:', targetImei);
      
      const { ImeiDiagnosticService } = await import('../../services/ImeiDiagnosticService.js');
      const results = await ImeiDiagnosticService.forceSyncImei(targetImei.trim());
      
      setLastDiagnostic(results);
      
      toast({
        title: "Synchronisation forcée",
        description: "Cache vidé et diagnostic relancé",
      });
      
    } catch (error) {
      console.error('Force sync error:', error);
      toast({
        title: "Erreur synchronisation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testEnhancedSearch = async () => {
    if (!targetImei.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un IMEI",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    try {
      console.log('🔍 Testing enhanced search for IMEI:', targetImei);
      
      const { ImeiDiagnosticService } = await import('../../services/ImeiDiagnosticService.js');
      const result = await ImeiDiagnosticService.enhancedImeiSearch(targetImei.trim());
      
      if (result) {
        toast({
          title: "Recherche améliorée réussie",
          description: `IMEI trouvé: ${result.imei}`,
        });
        console.log('✅ Enhanced search result:', result);
      } else {
        toast({
          title: "Recherche améliorée",
          description: "IMEI introuvable",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Enhanced search error:', error);
      toast({
        title: "Erreur recherche améliorée",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Diagnostic IMEI Avancé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="IMEI à diagnostiquer..."
            value={targetImei}
            onChange={(e) => setTargetImei(e.target.value)}
            disabled={isRunning}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            variant="default"
          >
            {isRunning ? "En cours..." : "🔍 Diagnostic Complet"}
          </Button>
          
          <Button 
            onClick={forceSync} 
            disabled={isRunning}
            variant="secondary"
          >
            🔄 Force Sync
          </Button>
          
          <Button 
            onClick={testEnhancedSearch} 
            disabled={isRunning}
            variant="outline"
          >
            🎯 Test Recherche
          </Button>
        </div>

        {lastDiagnostic && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Résultats pour {lastDiagnostic.imei}
                </h4>
                <Badge variant="outline">
                  {new Date(lastDiagnostic.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {lastDiagnostic.tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant={test.success ? "default" : "destructive"}>
                        {test.success ? "✅" : "❌"}
                      </Badge>
                      <span className="text-sm font-medium">{test.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {test.count !== undefined && (
                        <span>{test.count} résultat(s)</span>
                      )}
                      {test.totalDevicesScanned !== undefined && (
                        <span>{test.totalDevicesScanned} devices scannés</span>
                      )}
                      {test.cacheSize !== undefined && (
                        <span>Cache: {test.cacheSize} items</span>
                      )}
                      {test.error && (
                        <span className="text-destructive">Erreur: {test.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {lastDiagnostic.tests.some(test => test.success) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✅ IMEI trouvé dans: {lastDiagnostic.tests.filter(test => test.success).map(test => test.name).join(', ')}
                  </p>
                </div>
              )}

              {!lastDiagnostic.tests.some(test => test.success) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    ❌ IMEI introuvable dans tous les tests
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};