# Solution d'Affectation Automatique des SIMs aux Opérateurs

## 🎯 Objectif

Identifier automatiquement l'opérateur réseau utilisé par chaque carte SIM IoT, quelle que soit la plateforme (Things Mobile, Phenix, Truphone), et permettre de grouper/filtrer les SIMs par opérateur.

## ✅ Solution Implémentée

### Architecture

Le système est composé de plusieurs couches:

```
┌─────────────────────────────────────────────────────────────┐
│                  SimOperatorService                          │
│  (Service principal - Gestion unifiée)                       │
│  - getAllSimsWithOperators()                                 │
│  - groupSimsByOperator()                                     │
│  - getOperatorStats()                                        │
│  - findSimsByOperator()                                      │
│  - exportSimsByOperatorAsJson/Csv()                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              OperatorDetectionService                        │
│  (Détection d'opérateurs)                                    │
│  - detectThingsMobileOperator()                              │
│  - detectPhenixOperator()                                    │
│  - detectTruphoneOperator()                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Services API existants                          │
│  - ThingsMobileService                                       │
│  - PhenixService                                             │
│  - TruphoneService                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           Base de données d'opérateurs                       │
│  (operator-mapping.ts)                                       │
│  - 50+ opérateurs pré-configurés                             │
│  - Codes → Noms lisibles                                     │
│  - Informations pays, MCC, MNC                               │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Fichiers Créés

### 1. Types TypeScript
- **`src/types/operator.types.ts`**
  - Définitions des types pour opérateurs, SIMs, groupes
  - Interfaces pour statistiques et résultats

### 2. Base de données d'opérateurs
- **`src/data/operator-mapping.ts`**
  - 50+ opérateurs télécoms préconfigurés
  - Codes opérateurs (FRAOR, ITAWI, ESPVV, etc.)
  - Fonctions utilitaires de recherche

### 3. Services
- **`src/services/OperatorDetectionService.ts`**
  - Détection d'opérateur pour Things Mobile (via CDR)
  - Détection pour Phenix et Truphone
  - Traitement par batch avec respect des limites API

- **`src/services/SimOperatorService.ts`**
  - Service principal unifié
  - Collecte de toutes les SIMs
  - Groupement par opérateur
  - Statistiques et exports

### 4. Documentation
- **`docs/SIM_OPERATOR_DETECTION.md`**
  - Documentation complète avec exemples
  - Cas d'usage détaillés
  - Composants React

- **`docs/QUICK_START_OPERATOR_DETECTION.md`**
  - Guide de démarrage rapide
  - Configuration minimale
  - Exemples courts

### 5. Exemples
- **`examples/sim-operator-example.ts`**
  - Script d'exemple exécutable
  - Démonstration de toutes les fonctionnalités

## 🚀 Utilisation

### Cas d'usage principal: Afficher toutes les SIMs groupées par opérateur

```typescript
import { SimOperatorService } from './services/SimOperatorService';

async function afficherSimsParOperateur() {
  const service = SimOperatorService.getInstance();

  // 1. Récupérer toutes les SIMs avec leurs opérateurs
  const sims = await service.getAllSimsWithOperators();

  // 2. Grouper par opérateur
  const grouped = service.groupSimsByOperator(sims);

  // 3. Afficher les résultats
  grouped.forEach((group, operatorCode) => {
    console.log(`\n${group.operator?.name || operatorCode}:`);
    console.log(`  ${group.count} SIM(s)`);

    group.sims.forEach(sim => {
      console.log(`    - ${sim.msisdn} (${sim.platform})`);
    });
  });
}
```

### Obtenir un résumé formaté

```typescript
const summary = await service.getOperatorSummary();

summary.forEach(item => {
  console.log(`${item.operatorName} (${item.country}): ${item.simCount} SIMs`);
  console.log(`  Things Mobile: ${item.platforms.thingsmobile}`);
  console.log(`  Phenix: ${item.platforms.phenix}`);
  console.log(`  Truphone: ${item.platforms.truphone}`);
});
```

### Exporter les données

```typescript
// Export JSON
const jsonData = await service.exportSimsByOperatorAsJson();
fs.writeFileSync('sims_by_operator.json', jsonData);

// Export CSV
const csvData = await service.exportSimsByOperatorAsCsv();
fs.writeFileSync('sims_by_operator.csv', csvData);
```

## 🔍 Comment ça marche?

### 1. Pour Things Mobile

La détection se fait via l'API **CDR (Call Detail Records)** qui contient le champ `operator`:

```typescript
// Récupération des CDR des 7 derniers jours
const cdr = await getThingsMobileCdr({
  msisdnList: '882360001975037',
  startDateRange: '2024-10-28 00:00:00',
  endDateRange: '2024-11-04 23:59:59'
});

// Le CDR contient:
// - operator: "ITAWI" (code opérateur)
// - country: "IT"
// - timestamp: date de connexion
```

### 2. Pour Phenix et Truphone

Les méthodes de détection sont prêtes mais peuvent nécessiter des ajustements selon la structure exacte des réponses API (qui dépend de la documentation spécifique).

### 3. Mapping des codes

Les codes opérateurs (ex: "ITAWI") sont convertis en noms lisibles via la base de données:

```typescript
"ITAWI" → {
  name: "Wind Tre",
  country: "Italy",
  countryCode: "IT"
}
```

## 📊 Fonctionnalités Disponibles

### Recherche et Filtrage
- ✅ Récupérer toutes les SIMs avec opérateurs
- ✅ Filtrer par opérateur spécifique
- ✅ Filtrer par pays
- ✅ Filtrer par plateforme (Things Mobile, Phenix, Truphone)

### Groupement et Statistiques
- ✅ Grouper les SIMs par opérateur
- ✅ Statistiques globales
- ✅ Résumé par opérateur avec répartition par plateforme
- ✅ Liste des opérateurs non identifiés

### Export
- ✅ Export JSON (format structuré)
- ✅ Export CSV (format tabulaire)

### Performance
- ✅ Traitement par batch (limite les requêtes API simultanées)
- ✅ Respect des limites d'API (délais entre requêtes)
- ✅ Gestion des erreurs par plateforme

## 💡 Exemple Complet

```typescript
import { SimOperatorService } from './services/SimOperatorService';

async function main() {
  const service = SimOperatorService.getInstance();

  // 1. Récupérer les statistiques
  const stats = await service.getOperatorStats();
  console.log(`Total: ${stats.totalSims} SIMs`);
  console.log(`Opérateurs: ${stats.byOperator.size}`);

  // 2. Afficher le top 5 des opérateurs
  const summary = await service.getOperatorSummary();
  console.log('\nTop 5 opérateurs:');
  summary.slice(0, 5).forEach((item, i) => {
    console.log(`${i+1}. ${item.operatorName}: ${item.simCount} SIMs`);
  });

  // 3. Trouver toutes les SIMs Orange France
  const orangeSims = await service.findSimsByOperator('FRAOR');
  console.log(`\nSIMs Orange France: ${orangeSims.length}`);

  // 4. Exporter au format JSON
  const jsonData = await service.exportSimsByOperatorAsJson();
  console.log('\nExport JSON généré');
}

main();
```

## 🎨 Intégration dans un Composant React

Un exemple complet de tableau de bord React est disponible dans la documentation (`docs/SIM_OPERATOR_DETECTION.md`).

Exemple simplifié:

```tsx
import React, { useEffect, useState } from 'react';
import { SimOperatorService } from '../services/SimOperatorService';

export const DashboardOperateurs = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = SimOperatorService.getInstance();
    service.getOperatorSummary().then(data => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>SIMs par opérateur</h1>
      {summary.map(item => (
        <div key={item.operatorCode}>
          <h3>{item.operatorName}</h3>
          <p>{item.simCount} SIM(s) - {item.country}</p>
        </div>
      ))}
    </div>
  );
};
```

## ⚙️ Configuration Requise

Fichier `.env`:

```env
VITE_THINGSMOBILE_USERNAME=votre_username
VITE_THINGSMOBILE_TOKEN=votre_token
VITE_PHENIX_USERNAME=votre_username
VITE_PHENIX_PASSWORD=votre_password
VITE_TRUPHONE_API_KEY=votre_api_key
```

## 📝 Notes Importantes

### Limitations

1. **Things Mobile**: Seules les SIMs avec activité récente (7 derniers jours) auront un opérateur détecté
2. **Rate Limits**: Le système respecte les limites d'API (max 3 requêtes simultanées, délais de 1s)
3. **Cache**: Pas de cache actuellement - chaque appel fait de nouvelles requêtes API

### Opérateurs Inconnus

Si vous rencontrez des codes opérateurs inconnus:

1. Consultez `stats.unknownOperators` pour la liste
2. Ajoutez-les dans `src/data/operator-mapping.ts`:

```typescript
"NEWCODE": {
  code: "NEWCODE",
  name: "Nom Opérateur",
  country: "Pays",
  countryCode: "XX",
  mcc: "123",
  mnc: "45",
}
```

## 🎯 Résumé

Cette solution vous permet de:

✅ **Collecter** toutes les SIMs de toutes vos plateformes
✅ **Identifier** automatiquement l'opérateur de chaque SIM
✅ **Grouper** les SIMs par opérateur
✅ **Rechercher** et filtrer facilement
✅ **Exporter** les données (JSON/CSV)
✅ **Visualiser** avec des statistiques claires

Le tout avec une API TypeScript simple et bien documentée!

## 📚 Documentation Complète

- Guide complet: `docs/SIM_OPERATOR_DETECTION.md`
- Démarrage rapide: `docs/QUICK_START_OPERATOR_DETECTION.md`
- Exemple exécutable: `examples/sim-operator-example.ts`

## 🚦 Prochaines Étapes Recommandées

1. Tester le système avec vos données réelles
2. Ajuster les codes opérateurs selon vos besoins
3. Implémenter un système de cache si nécessaire
4. Créer un tableau de bord visuel dans votre application React
5. Configurer des alertes pour les opérateurs coûteux

---

**Auteur**: Claude (Assistant IA)
**Date**: 2025-11-04
**Version**: 1.0
