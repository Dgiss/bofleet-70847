# Détection et Gestion des Opérateurs pour les Cartes SIM IoT

## Vue d'ensemble

Ce système permet d'identifier automatiquement l'opérateur réseau utilisé par chaque carte SIM IoT, quelle que soit la plateforme (Things Mobile, Phenix, Truphone).

## Architecture

Le système est composé de trois couches principales :

1. **Types et Données** (`src/types/operator.types.ts`, `src/data/operator-mapping.ts`)
   - Définitions des types TypeScript
   - Base de données des opérateurs avec leurs codes

2. **Services de Détection** (`src/services/OperatorDetectionService.ts`)
   - Extraction des informations d'opérateur depuis les APIs
   - Support multi-plateforme (Things Mobile, Phenix, Truphone)

3. **Service Unifié** (`src/services/SimOperatorService.ts`)
   - Gestion centralisée de toutes les SIMs
   - Groupement par opérateur
   - Statistiques et exports

## Guide d'utilisation

### 1. Récupérer toutes les SIMs avec leurs opérateurs

```typescript
import { SimOperatorService } from './services/SimOperatorService';

async function getAllSimsWithOperators() {
  const service = SimOperatorService.getInstance();

  // Récupère toutes les SIMs de toutes les plateformes
  // et détecte automatiquement leurs opérateurs
  const sims = await service.getAllSimsWithOperators();

  console.log(`Total de SIMs: ${sims.length}`);

  sims.forEach(sim => {
    const operatorName = sim.currentOperator?.operator?.name || 'Inconnu';
    console.log(`${sim.msisdn} - ${operatorName} (${sim.platform})`);
  });

  return sims;
}
```

### 2. Obtenir des statistiques par opérateur

```typescript
import { SimOperatorService } from './services/SimOperatorService';

async function getOperatorStatistics() {
  const service = SimOperatorService.getInstance();
  const stats = await service.getOperatorStats();

  console.log(`Total de SIMs: ${stats.totalSims}`);
  console.log(`Dernière mise à jour: ${stats.lastUpdated}`);

  // Parcourir les statistiques par opérateur
  stats.byOperator.forEach((group, code) => {
    console.log(`\nOpérateur: ${code}`);
    console.log(`  Nom: ${group.operator?.name || 'Inconnu'}`);
    console.log(`  Pays: ${group.operator?.country || 'Inconnu'}`);
    console.log(`  Nombre de SIMs: ${group.count}`);
  });

  // Afficher les opérateurs inconnus
  if (stats.unknownOperators.length > 0) {
    console.log('\nOpérateurs non identifiés:');
    stats.unknownOperators.forEach(code => {
      console.log(`  - ${code}`);
    });
  }

  return stats;
}
```

### 3. Grouper les SIMs par opérateur

```typescript
import { SimOperatorService } from './services/SimOperatorService';

async function groupSimsByOperator() {
  const service = SimOperatorService.getInstance();
  const sims = await service.getAllSimsWithOperators();
  const grouped = service.groupSimsByOperator(sims);

  // Afficher les groupes
  grouped.forEach((group, operatorCode) => {
    console.log(`\n=== ${group.operator?.name || operatorCode} ===`);
    console.log(`Nombre de SIMs: ${group.count}`);

    // Afficher les 5 premières SIMs du groupe
    group.sims.slice(0, 5).forEach(sim => {
      console.log(`  - ${sim.msisdn} (${sim.platform})`);
    });

    if (group.count > 5) {
      console.log(`  ... et ${group.count - 5} autres`);
    }
  });

  return grouped;
}
```

### 4. Rechercher des SIMs par opérateur

```typescript
import { SimOperatorService } from './services/SimOperatorService';

async function findSimsByOperator(operatorCode: string) {
  const service = SimOperatorService.getInstance();
  const sims = await service.findSimsByOperator(operatorCode);

  console.log(`SIMs utilisant l'opérateur ${operatorCode}:`);
  sims.forEach(sim => {
    console.log(`  - ${sim.msisdn} (${sim.platform}) - ${sim.status}`);
  });

  return sims;
}

// Exemple d'utilisation
findSimsByOperator('FRAOR'); // Orange France
findSimsByOperator('ITAWI'); // Wind Italy
```

### 5. Rechercher des SIMs par pays

```typescript
import { SimOperatorService } from './services/SimOperatorService';

async function findSimsByCountry(countryCode: string) {
  const service = SimOperatorService.getInstance();
  const sims = await service.findSimsByCountry(countryCode);

  console.log(`SIMs en ${countryCode}:`);
  sims.forEach(sim => {
    const operatorName = sim.currentOperator?.operator?.name || 'Inconnu';
    console.log(`  - ${sim.msisdn} - ${operatorName}`);
  });

  return sims;
}

// Exemple d'utilisation
findSimsByCountry('FR'); // France
findSimsByCountry('IT'); // Italie
findSimsByCountry('ES'); // Espagne
```

### 6. Obtenir un résumé formaté

```typescript
import { SimOperatorService } from './services/SimOperatorService';

async function displayOperatorSummary() {
  const service = SimOperatorService.getInstance();
  const summary = await service.getOperatorSummary();

  console.log('\n=== RÉSUMÉ PAR OPÉRATEUR ===\n');

  summary.forEach(item => {
    console.log(`${item.operatorName} (${item.country})`);
    console.log(`  Code: ${item.operatorCode}`);
    console.log(`  SIMs: ${item.simCount}`);
    console.log(`  Répartition:`);
    console.log(`    - Things Mobile: ${item.platforms.thingsmobile}`);
    console.log(`    - Phenix: ${item.platforms.phenix}`);
    console.log(`    - Truphone: ${item.platforms.truphone}`);
    console.log('');
  });
}
```

### 7. Exporter les données

#### Export JSON

```typescript
import { SimOperatorService } from './services/SimOperatorService';
import fs from 'fs';

async function exportToJson() {
  const service = SimOperatorService.getInstance();
  const jsonData = await service.exportSimsByOperatorAsJson();

  // Sauvegarder dans un fichier
  fs.writeFileSync('sims_by_operator.json', jsonData);
  console.log('Export JSON créé: sims_by_operator.json');

  return jsonData;
}
```

#### Export CSV

```typescript
import { SimOperatorService } from './services/SimOperatorService';
import fs from 'fs';

async function exportToCsv() {
  const service = SimOperatorService.getInstance();
  const csvData = await service.exportSimsByOperatorAsCsv();

  // Sauvegarder dans un fichier
  fs.writeFileSync('sims_by_operator.csv', csvData);
  console.log('Export CSV créé: sims_by_operator.csv');

  return csvData;
}
```

### 8. Détecter l'opérateur d'une seule SIM

```typescript
import { OperatorDetectionService } from './services/OperatorDetectionService';

async function detectSingleSimOperator() {
  const service = OperatorDetectionService.getInstance();

  // Pour Things Mobile
  const tmOperator = await service.detectThingsMobileOperator('882360001975037');
  if (tmOperator) {
    console.log(`Opérateur: ${tmOperator.operator?.name || tmOperator.code}`);
    console.log(`Pays: ${tmOperator.country}`);
    console.log(`Dernière connexion: ${tmOperator.lastSeen}`);
  }

  // Pour Phenix
  const phenixOperator = await service.detectPhenixOperator('447937557899');

  // Pour Truphone
  const truphoneOperator = await service.detectTruphoneOperator('8944501312167518236');
}
```

## Utilisation dans un composant React

```typescript
import React, { useEffect, useState } from 'react';
import { SimOperatorService } from '../services/SimOperatorService';
import { SimWithOperator } from '../types/operator.types';

export const SimOperatorDashboard: React.FC = () => {
  const [sims, setSims] = useState<SimWithOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const service = SimOperatorService.getInstance();

      // Charger les SIMs avec leurs opérateurs
      const allSims = await service.getAllSimsWithOperators();
      setSims(allSims);

      // Charger le résumé
      const operatorSummary = await service.getOperatorSummary();
      setSummary(operatorSummary);
    } catch (error) {
      console.error('Error loading SIM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = async () => {
    const service = SimOperatorService.getInstance();
    const jsonData = await service.exportSimsByOperatorAsJson();

    // Télécharger le fichier
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sims_by_operator.json';
    a.click();
  };

  const handleExportCsv = async () => {
    const service = SimOperatorService.getInstance();
    const csvData = await service.exportSimsByOperatorAsCsv();

    // Télécharger le fichier
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sims_by_operator.csv';
    a.click();
  };

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  return (
    <div className="sim-operator-dashboard">
      <h1>Tableau de bord - SIMs par opérateur</h1>

      <div className="summary">
        <h2>Total de SIMs: {sims.length}</h2>

        <div className="actions">
          <button onClick={handleExportJson}>Exporter JSON</button>
          <button onClick={handleExportCsv}>Exporter CSV</button>
          <button onClick={loadData}>Actualiser</button>
        </div>
      </div>

      <div className="operator-list">
        <h2>Répartition par opérateur</h2>
        {summary.map((item, index) => (
          <div key={index} className="operator-card">
            <h3>{item.operatorName}</h3>
            <p>Pays: {item.country}</p>
            <p>Code: {item.operatorCode}</p>
            <p>Nombre de SIMs: {item.simCount}</p>
            <div className="platform-breakdown">
              <span>Things Mobile: {item.platforms.thingsmobile}</span>
              <span>Phenix: {item.platforms.phenix}</span>
              <span>Truphone: {item.platforms.truphone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Ajout de nouveaux opérateurs

Pour ajouter un nouvel opérateur à la base de données, éditez le fichier `src/data/operator-mapping.ts`:

```typescript
export const OPERATOR_DATABASE: Record<string, Operator> = {
  // ... opérateurs existants ...

  "NEWOP": {
    code: "NEWOP",
    name: "Nom de l'opérateur",
    country: "Pays",
    countryCode: "XX",
    mcc: "123",
    mnc: "45",
  },
};
```

## Limitations et notes importantes

1. **Things Mobile**: La détection d'opérateur fonctionne via les CDR (Call Detail Records). Les SIMs sans activité récente (7 derniers jours) peuvent ne pas avoir d'opérateur détecté.

2. **Phenix et Truphone**: La détection d'opérateur dépend de la structure exacte des réponses API, qui peut varier. Les méthodes sont prêtes mais peuvent nécessiter des ajustements selon les données réelles retournées.

3. **Limites d'API**: Le service respecte les limites d'API en limitant le nombre de requêtes simultanées (max 3 par défaut) et en ajoutant des délais entre les requêtes.

4. **Cache**: Actuellement, il n'y a pas de cache. Chaque appel à `getAllSimsWithOperators()` effectue de nouvelles requêtes API. Pour de meilleures performances en production, envisagez d'ajouter un système de cache.

## Dépannage

### Aucun opérateur détecté pour les SIMs Things Mobile

- Vérifiez que la SIM a eu une activité récente (connexion dans les 7 derniers jours)
- Vérifiez que les credentials Things Mobile sont corrects dans `.env`
- Consultez les logs de la console pour voir les erreurs API

### Codes opérateurs inconnus

- Ajoutez le code manquant dans `src/data/operator-mapping.ts`
- Consultez la liste `stats.unknownOperators` pour identifier les codes à ajouter

### Erreurs d'authentification

- Vérifiez que tous les credentials sont configurés dans `.env`:
  - `VITE_THINGSMOBILE_USERNAME` et `VITE_THINGSMOBILE_TOKEN`
  - `VITE_PHENIX_USERNAME` et `VITE_PHENIX_PASSWORD`
  - `VITE_TRUPHONE_API_KEY`

## Support et contribution

Pour toute question ou suggestion d'amélioration, consultez la documentation API de chaque opérateur ou créez une issue dans le repository du projet.
