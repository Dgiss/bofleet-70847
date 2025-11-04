
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkAuthStatus, getCurrentUserInfo, forceSignOut } from '@/services/AuthService';
import * as CompanyVehicleDeviceService from '@/services/CompanyVehicleDeviceService';
import { removeCache, clearOldCaches } from '@/utils/cache-utils';

interface User {
  username: string;
  userId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  forceLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider rendering...');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('AuthContext: Vérification de l\'authentification...');
      const { isAuthenticated: authStatus, user: authUser } = await checkAuthStatus();
      
      console.log('AuthContext: Statut auth:', authStatus);
      setIsAuthenticated(authStatus);
      
      if (authStatus && authUser) {
        const userData = {
          username: authUser.username,
          userId: authUser.userId || authUser.username
        };
        setUser(userData);
        console.log('AuthContext: Utilisateur défini:', userData.username);
      } else {
        setUser(null);
        console.log('AuthContext: Aucun utilisateur');
      }
    } catch (error) {
      console.error('AuthContext: Erreur de vérification auth:', error);
      setIsAuthenticated(false);
      setUser(null);
      
      // En cas d'erreur, nettoyer complètement
      try {
        await forceSignOut();
      } catch (cleanupError) {
        console.error('AuthContext: Erreur de nettoyage:', cleanupError);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    console.log('AuthContext: Connexion utilisateur:', userData.username);
    setIsAuthenticated(true);
    setUser(userData);
    
    // REMOVED: No more pre-loading cache at login to avoid QuotaExceededError
    // Cache will be loaded on-demand when user navigates to vehicles page
  };

  const logout = () => {
    console.log('AuthContext: Déconnexion utilisateur');
    setIsAuthenticated(false);
    setUser(null);
    
    // Clear cache on logout to free up localStorage space
    removeCache('vehicle_cache');
    clearOldCaches();
  };

  const forceLogout = async () => {
    try {
      console.log('AuthContext: Déconnexion forcée...');
      await forceSignOut();
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear cache on force logout
      removeCache('vehicle_cache');
      clearOldCaches();
    } catch (error) {
      console.error('AuthContext: Erreur lors de la déconnexion forcée:', error);
      // Forcer la déconnexion côté client même si l'API échoue
      setIsAuthenticated(false);
      setUser(null);
      
      // Still try to clear cache
      removeCache('vehicle_cache');
      clearOldCaches();
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    forceLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
