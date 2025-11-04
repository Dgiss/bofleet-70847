
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Key } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import * as ApiConfigService from '@/services/ApiConfigService';
import * as FlespiService from '@/services/FlespiService';

interface FlespiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlespiConfigDialog({ open, onOpenChange }: FlespiConfigDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  
  // Load current API key on open
  useEffect(() => {
    if (open) {
      const currentKey = ApiConfigService.getFlespiApiKey();
      setApiKey(currentKey || '');
      
      // Test current key if it exists
      if (currentKey) {
        testConnection(currentKey);
      }
    }
  }, [open]);

  const testConnection = async (keyToTest?: string) => {
    const testKey = keyToTest || apiKey;
    if (!testKey) {
      setConnectionStatus('invalid');
      return;
    }

    setTesting(true);
    try {
      // Temporarily set the key for testing
      if (keyToTest) {
        ApiConfigService.setFlespiApiKey(testKey);
      }
      
      const isValid = await FlespiService.testConnection();
      setConnectionStatus(isValid ? 'valid' : 'invalid');
      
      if (isValid) {
        toast({
          title: "Connexion réussie",
          description: "La clé API Flespi est valide et fonctionnelle",
        });
      } else {
        toast({
          title: "Connexion échouée",
          description: "La clé API Flespi est invalide ou ne fonctionne pas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing Flespi connection:', error);
      setConnectionStatus('invalid');
      toast({
        title: "Erreur de test",
        description: "Impossible de tester la connexion Flespi",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Clé API requise",
        description: "Veuillez saisir une clé API Flespi",
        variant: "destructive",
      });
      return;
    }

    ApiConfigService.setFlespiApiKey(apiKey.trim());
    
    toast({
      title: "Configuration sauvegardée",
      description: "La clé API Flespi a été sauvegardée avec succès",
    });
    
    // Test the saved key
    testConnection(apiKey.trim());
  };

  const handleClear = () => {
    ApiConfigService.removeFlespiApiKey();
    setApiKey('');
    setConnectionStatus('unknown');
    
    toast({
      title: "Configuration effacée",
      description: "La clé API Flespi a été supprimée",
    });
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'valid':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connecté
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Déconnecté
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Key className="w-3 h-3 mr-1" />
            Non testé
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuration API Flespi</DialogTitle>
          <DialogDescription>
            Configurez votre clé API Flespi pour accéder aux données des dispositifs de suivi. 
            Cette clé est stockée localement sur votre navigateur pour des raisons de sécurité.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Statut de connexion</Label>
            {getStatusBadge()}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="flespi-api-key">Clé API Flespi</Label>
            <Input
              id="flespi-api-key"
              type="password"
              placeholder="Saisissez votre clé API Flespi..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Vous pouvez obtenir votre clé API sur{' '}
              <a 
                href="https://flespi.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                flespi.io
              </a>
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => testConnection()}
              disabled={!apiKey.trim() || testing}
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test...
                </>
              ) : (
                'Tester'
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!apiKey}
            >
              Effacer
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!apiKey.trim()}>
              Sauvegarder
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
