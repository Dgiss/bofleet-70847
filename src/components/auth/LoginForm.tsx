
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, User, Lock, RefreshCw } from 'lucide-react';
import { signInUser } from '@/services/AuthService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface LoginFormData {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const { login, forceLogout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSessionRecovery = async () => {
    setIsRecovering(true);
    try {
      
      await forceLogout();
      toast({
        title: "Session nettoyée",
        description: "Vous pouvez maintenant vous reconnecter",
      });
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      toast({
        title: "Erreur de récupération",
        description: "Veuillez rafraîchir la page",
        variant: "destructive",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      
      const result = await signInUser(data.username, data.password);
      
      if (result.success) {
        const userData = {
          username: data.username,
          userId: data.username
        };
        
        login(userData);
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans Geoloc Systems",
        });
        
        
        navigate('/entreprises');
      } else {
        console.error('LoginForm: Échec de connexion:', result.error);
        
        // Gestion spécifique des erreurs de session
        if (result.error.includes('Session corrompue') || result.error.includes('already signed in')) {
          toast({
            title: "Problème de session détecté",
            description: "Utilisez le bouton 'Nettoyer la session' ci-dessous",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur de connexion",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('LoginForm: Erreur inattendue:', error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="username"
              type="text"
              placeholder="Nom d'utilisateur"
              className="pl-10"
              autoComplete="username"
              {...register('username', { 
                required: "Nom d'utilisateur requis" 
              })}
            />
          </div>
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              className="pl-10 pr-10"
              autoComplete="current-password"
              {...register('password', { 
                required: 'Mot de passe requis' 
              })}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-500 hover:bg-blue-600" 
          disabled={isLoading || isRecovering}
        >
          {isLoading ? 'Connexion...' : 'Connexion'}
        </Button>
      </form>

      {/* Bouton de récupération de session */}
      <div className="pt-2 border-t">
        <Button 
          type="button"
          variant="outline"
          className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          onClick={handleSessionRecovery}
          disabled={isLoading || isRecovering}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
          {isRecovering ? 'Nettoyage...' : 'Nettoyer la session'}
        </Button>
        <p className="text-xs text-gray-500 mt-1 text-center">
          En cas de problème de connexion
        </p>
      </div>
    </div>
  );
};
