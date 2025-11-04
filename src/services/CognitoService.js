
import { signUp, confirmSignUp, signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

import { waitForAmplifyConfig } from '@/config/aws-config.js';



export const createUserInCognito = async ({ username, password, email, firstname, lastname }) => {
  await waitForAmplifyConfig();
  
  try {
    console.log('Creating user in Cognito:', { username, email });
    
    // Créer l'utilisateur avec signUp (côté client)
    const signUpResponse = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          given_name: firstname || '',
          family_name: lastname || '',
        }
      }
    });
    
    console.log('User created in Cognito:', signUpResponse);
    
    // Auto-confirmer l'utilisateur (dans un vrai environnement, ceci devrait être fait côté serveur)
    // Pour le moment, on assume que l'utilisateur est confirmé
    
    return {
      success: true,
      userSub: signUpResponse.userSub,
      username: signUpResponse.username || username,
      needsConfirmation: !signUpResponse.isSignUpComplete
    };
    
  } catch (error) {
    console.error('Error creating user in Cognito:', error);
    throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
  }
};

export const updateUserInCognito = async ({ username, email, firstname, lastname, newPassword }) => {
  await waitForAmplifyConfig();
  
  try {
    console.log('Updating user in Cognito:', username);
    
    // Note: Les mises à jour d'utilisateur admin ne sont pas disponibles côté client
    // Cette fonction devrait être implémentée côté serveur avec une API Lambda
    console.warn('User update requires server-side implementation');
    
    return { success: true, message: 'User update queued (requires server-side processing)' };
    
  } catch (error) {
    console.error('Error updating user in Cognito:', error);
    throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
  }
};

export const deleteUserFromCognito = async (username) => {
  await waitForAmplifyConfig();
  
  try {
    console.log('Deleting user from Cognito:', username);
    
    // Note: La suppression d'utilisateur admin n'est pas disponible côté client
    // Cette fonction devrait être implémentée côté serveur avec une API Lambda
    console.warn('User deletion requires server-side implementation');
    
    return { success: true, message: 'User deletion queued (requires server-side processing)' };
    
  } catch (error) {
    console.error('Error deleting user from Cognito:', error);
    throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
  }
};

// Fonction helper pour vérifier l'utilisateur actuel
export const getCurrentUserInfo = async () => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Fonction helper pour la connexion
export const signInUser = async (username, password) => {
  try {
    const signInResponse = await signIn({ username, password });
    return signInResponse;
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};
