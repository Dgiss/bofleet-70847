
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { isAmplifyConfigured, waitForAmplifyConfig } from '@/config/aws-config.js';

// Fonction pour forcer la déconnexion complète
export const forceSignOut = async () => {
  try {
    await waitForAmplifyConfig();
    await signOut({ global: true });
    localStorage.removeItem('alreadyLogged');
    localStorage.removeItem('loginExpiration');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la déconnexion forcée:', error);
    // Nettoyer localStorage même si signOut échoue
    localStorage.removeItem('alreadyLogged');
    localStorage.removeItem('loginExpiration');
    return { success: false, error: error.message };
  }
};

export const signInUser = async (username, password) => {
  try {
    console.log('Tentative de connexion pour:', username);
    
    // Vérifier que Amplify est configuré
    if (!isAmplifyConfigured()) {
      console.log('Amplify non configuré, attente de la configuration...');
      await waitForAmplifyConfig();
    }
    
    // Vérifier d'abord si l'utilisateur est déjà connecté
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        console.log('Utilisateur déjà connecté détecté, déconnexion forcée...');
        await forceSignOut();
      }
    } catch (error) {
      console.log('Aucun utilisateur connecté détecté');
    }

    const { isSignedIn, nextStep } = await signIn({ username, password });
    
    if (nextStep.signInStep === 'DONE') {
      // Créer un cookie d'expiration de 2 heures
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 2);
      
      // Stocker dans localStorage pour la session
      localStorage.setItem('alreadyLogged', 'true');
      localStorage.setItem('loginExpiration', expirationDate.getTime().toString());
      
      console.log('Connexion réussie pour:', username);
      return { success: true, user: isSignedIn };
    }
    
    return { success: false, error: 'Étape de connexion non terminée' };
  } catch (error) {
    console.error('Erreur de connexion:', error);
    
    // Gérer spécifiquement l'erreur de configuration
    if (error.message && error.message.includes('Auth UserPool not configured')) {
      console.log('Erreur de configuration détectée, nouvelle tentative...');
      try {
        await waitForAmplifyConfig();
        // Réessayer la connexion après configuration
        const retryResult = await signIn({ username, password });
        if (retryResult.nextStep.signInStep === 'DONE') {
          const expirationDate = new Date();
          expirationDate.setHours(expirationDate.getHours() + 2);
          localStorage.setItem('alreadyLogged', 'true');
          localStorage.setItem('loginExpiration', expirationDate.getTime().toString());
          return { success: true, user: retryResult.isSignedIn };
        }
      } catch (retryError) {
        console.error('Échec de la nouvelle tentative:', retryError);
        return { 
          success: false, 
          error: 'Problème de configuration. Veuillez rafraîchir la page et réessayer.' 
        };
      }
    }
    
    // Gérer spécifiquement l'erreur "already signed in"
    if (error.message && error.message.includes('already signed in')) {
      console.log('Erreur "already signed in" détectée, tentative de récupération...');
      try {
        await forceSignOut();
        // Réessayer la connexion après déconnexion
        const retryResult = await signIn({ username, password });
        if (retryResult.nextStep.signInStep === 'DONE') {
          const expirationDate = new Date();
          expirationDate.setHours(expirationDate.getHours() + 2);
          localStorage.setItem('alreadyLogged', 'true');
          localStorage.setItem('loginExpiration', expirationDate.getTime().toString());
          return { success: true, user: retryResult.isSignedIn };
        }
      } catch (retryError) {
        console.error('Échec de la récupération après "already signed in":', retryError);
        return { 
          success: false, 
          error: 'Session corrompue. Veuillez rafraîchir la page et réessayer.' 
        };
      }
    }
    
    return { 
      success: false, 
      error: error.message || 'Erreur de connexion' 
    };
  }
};

export const signOutUser = async () => {
  try {
    await waitForAmplifyConfig();
    await signOut({ global: true });
    localStorage.removeItem('alreadyLogged');
    localStorage.removeItem('loginExpiration');
    console.log('Déconnexion réussie');
    return { success: true };
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    // Nettoyer localStorage même si signOut échoue
    localStorage.removeItem('alreadyLogged');
    localStorage.removeItem('loginExpiration');
    return { success: false, error: error.message };
  }
};

export const checkAuthStatus = async () => {
  try {
    console.log('Vérification du statut d\'authentification...');
    
    // Attendre que Amplify soit configuré
    await waitForAmplifyConfig();
    
    const alreadyLogged = localStorage.getItem('alreadyLogged');
    const loginExpiration = localStorage.getItem('loginExpiration');
    
    console.log('localStorage - alreadyLogged:', alreadyLogged);
    console.log('localStorage - loginExpiration:', loginExpiration);
    
    // Vérifier l'expiration du localStorage
    if (loginExpiration) {
      const now = new Date().getTime();
      if (now > parseInt(loginExpiration)) {
        console.log('Session localStorage expirée, nettoyage...');
        localStorage.removeItem('alreadyLogged');
        localStorage.removeItem('loginExpiration');
        try {
          await signOut({ global: true });
        } catch (error) {
          console.log('Erreur lors du nettoyage de session:', error);
        }
        return { isAuthenticated: false };
      }
    }
    
    // Vérifier l'état Cognito
    let cognitoUser = null;
    try {
      cognitoUser = await getCurrentUser();
      console.log('Utilisateur Cognito trouvé:', cognitoUser?.username);
    } catch (error) {
      console.log('Aucun utilisateur Cognito actif');
    }
    
    // Synchroniser les états
    if (cognitoUser && !alreadyLogged) {
      console.log('Synchronisation: utilisateur Cognito sans localStorage');
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 2);
      localStorage.setItem('alreadyLogged', 'true');
      localStorage.setItem('loginExpiration', expirationDate.getTime().toString());
      return { isAuthenticated: true, user: cognitoUser };
    }
    
    if (!cognitoUser && alreadyLogged) {
      console.log('Synchronisation: localStorage sans utilisateur Cognito, nettoyage...');
      localStorage.removeItem('alreadyLogged');
      localStorage.removeItem('loginExpiration');
      return { isAuthenticated: false };
    }
    
    if (cognitoUser && alreadyLogged) {
      console.log('Sessions synchronisées, utilisateur authentifié');
      return { isAuthenticated: true, user: cognitoUser };
    }
    
    console.log('Aucune session active');
    return { isAuthenticated: false };
    
  } catch (error) {
    console.error('Erreur de vérification du statut:', error);
    localStorage.removeItem('alreadyLogged');
    localStorage.removeItem('loginExpiration');
    return { isAuthenticated: false };
  }
};

export const getCurrentUserInfo = async () => {
  try {
    await waitForAmplifyConfig();
    const user = await getCurrentUser();
    console.log('Informations utilisateur récupérées:', user?.username);
    return user;
  } catch (error) {
    console.error('Erreur de récupération utilisateur:', error);
    return null;
  }
};
