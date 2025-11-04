
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// Configuration pour AWS Amplify v6
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "eu-west-3_K0BoxUFkS",
      userPoolClientId: "1bg4vbumtfgjmro8n65ce4c859",
      identityPoolId: "eu-west-3:5fdebe79-865b-40ec-8de0-f0b04dbbae29",
      loginWith: {
        username: true,
        email: false,
        phone: false
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        phone_number: {
          required: false
        }
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireNumbers: false,
        requireSpecialCharacters: false
      },
      mfa: {
        status: "off",
        smsEnabled: true,
        totpEnabled: false
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: "https://77e55jvfordw5c6tb5bmh6loiq.appsync-api.eu-west-3.amazonaws.com/graphql",
      region: "eu-west-3",
      defaultAuthMode: "userPool",
      apiKey: "da2-madtpj74mjallnjpbhca7owzym"
    },
    REST: {
      AdminQueries: {
        endpoint: "https://j49tvrfjf1.execute-api.eu-west-3.amazonaws.com/fwatcher",
        region: "eu-west-3"
      }
    }
  }
};

let isConfigured = false;
let configurationPromise = null;

export const configureAmplify = () => {
  if (configurationPromise) {
    return configurationPromise;
  }

  configurationPromise = new Promise((resolve, reject) => {
    try {
      console.log('Configuration d\'Amplify en cours...');
      
      if (isConfigured) {
        console.log('Amplify déjà configuré');
        resolve(true);
        return;
      }
      
      // Configuration synchrone d'Amplify v6
      Amplify.configure(awsConfig, { ssr: false });
      
      // Vérifier que la configuration est bien appliquée
      const config = Amplify.getConfig();
      if (!config?.Auth?.Cognito) {
        throw new Error('Configuration Amplify Auth incomplète');
      }
      
      isConfigured = true;
      console.log('Amplify v6 configuré avec succès');
      resolve(true);
      
    } catch (error) {
      console.error('Erreur lors de la configuration d\'Amplify:', error);
      isConfigured = false;
      configurationPromise = null;
      reject(error);
    }
  });

  return configurationPromise;
};

export const isAmplifyConfigured = () => {
  return isConfigured;
};

export const waitForAmplifyConfig = async () => {
  // Si déjà configuré, vérifier que c'est bien effectif
  if (isConfigured) {
    try {
      const config = Amplify.getConfig();
      if (config?.Auth?.Cognito) {
        return true;
      }
      // Si la config n'est pas correcte, réinitialiser
      console.warn('Configuration invalide détectée, reconfiguration...');
      isConfigured = false;
      configurationPromise = null;
    } catch (error) {
      console.warn('Erreur vérification config:', error);
      isConfigured = false;
      configurationPromise = null;
    }
  }
  
  if (configurationPromise) {
    try {
      return await configurationPromise;
    } catch (error) {
      console.error('Erreur lors de l\'attente de la configuration:', error);
      // Reset promise to allow retry
      configurationPromise = null;
      isConfigured = false;
      throw error;
    }
  }
  
  return await configureAmplify();
};

// Vérifier si l'utilisateur a des credentials valides
export const ensureCredentials = async () => {
  try {
    await waitForAmplifyConfig();
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.warn('Aucun utilisateur authentifié trouvé:', error);
    return false;
  }
};

// Fonction de retry pour les requêtes avec gestion des credentials
export const withCredentialRetry = async (operation, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Vérifier les credentials avant chaque tentative
      const hasCredentials = await ensureCredentials();
      if (!hasCredentials) {
        throw new Error('Utilisateur non authentifié - veuillez vous reconnecter');
      }
      
      return await operation();
    } catch (error) {
      // Log the original error for debugging before transforming it
      console.error(`Tentative ${attempt}/${maxRetries} - Erreur originale:`, {
        message: error.message,
        code: error.code,
        name: error.name,
        errors: error.errors,
        stack: error.stack
      });
      
      console.warn(`Tentative ${attempt}/${maxRetries} échouée:`, error.message);
      
      if (error.message?.includes('NoCredentials') || error.message?.includes('No credentials')) {
        if (attempt < maxRetries) {
          console.log('Nouvelle tentative avec attente...');
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw new Error('Erreur d\'authentification - veuillez vous reconnecter');
      }
      
      // For GraphQL errors, preserve more detail
      if (error.errors && Array.isArray(error.errors)) {
        const graphqlError = new Error(`GraphQL Error: ${error.errors.map(e => e.message).join(', ')}`);
        graphqlError.originalError = error;
        graphqlError.errors = error.errors;
        throw graphqlError;
      }
      
      // Pour les autres erreurs, ne pas retry mais préserver l'erreur originale
      throw error;
    }
  }
};

// Helpers GraphQL - création paresseuse du client
let graphQLClient = null;

export const getGraphQLClient = async () => {
  await waitForAmplifyConfig();
  if (!graphQLClient) {
    graphQLClient = generateClient({ authMode: 'userPool' });
  }
  return graphQLClient;
};

// Wrapper paresseux conservant l'API client.graphql existante
export const getLazyClient = () => ({
  graphql: (params) => getGraphQLClient().then(c => c.graphql(params))
});

export default awsConfig;
