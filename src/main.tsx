import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { configureAmplify } from './config/aws-config.js';
import './index.css';

// Configurer Amplify au démarrage avec vérification
const initializeApp = async () => {
  console.log('Initialisation de l\'application...');

  const configSuccess = await configureAmplify();
  if (!configSuccess) {
    console.error('Échec de la configuration Amplify');
  }

  console.log('Application prête à démarrer');
  createRoot(document.getElementById("root")!).render(<App />);
};

initializeApp();
