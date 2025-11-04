# Guide de Démarrage Rapide - Détection d'Opérateurs

## Installation

Aucune installation supplémentaire n'est nécessaire. Le système utilise les dépendances déjà présentes dans le projet.

## Configuration

Assurez-vous que votre fichier `.env` contient les credentials pour au moins une plateforme:

```env
# Things Mobile
VITE_THINGSMOBILE_USERNAME=votre_username
VITE_THINGSMOBILE_TOKEN=votre_token

# Phenix
VITE_PHENIX_USERNAME=votre_username
VITE_PHENIX_PASSWORD=votre_password

# Truphone
VITE_TRUPHONE_API_KEY=votre_api_key
```

## Utilisation de Base

### 1. Récupérer toutes les SIMs avec leurs opérateurs

```typescript
import { SimOperatorService } from './services/SimOperatorService';

const service = SimOperatorService.getInstance();
const sims = await service.getAllSimsWithOperators();

console.log(`Total: ${sims.length} SIMs`);
```

### 2. Obtenir un résumé par opérateur

```typescript
const summary = await service.getOperatorSummary();

summary.forEach(item => {
  console.log(`${item.operatorName}: ${item.simCount} SIMs`);
});
```

### 3. Rechercher par opérateur

```typescript
// Trouver toutes les SIMs sur Orange France
const orangeSims = await service.findSimsByOperator('FRAOR');
```

### 4. Rechercher par pays

```typescript
// Trouver toutes les SIMs en France
const frenchSims = await service.findSimsByCountry('FR');
```

### 5. Exporter les données

```typescript
// Export JSON
const jsonData = await service.exportSimsByOperatorAsJson();
// Sauvegarder ou envoyer jsonData

// Export CSV
const csvData = await service.exportSimsByOperatorAsCsv();
// Sauvegarder ou envoyer csvData
```

## Script d'exemple

Un script d'exemple complet est disponible dans `examples/sim-operator-example.ts`.

Pour l'exécuter:

```bash
npx ts-node examples/sim-operator-example.ts
```

## Codes opérateurs courants

| Code   | Opérateur               | Pays   |
|--------|------------------------|--------|
| FRAOR  | Orange France          | FR     |
| FRASFR | SFR                    | FR     |
| FRABG  | Bouygues Telecom       | FR     |
| ITAWI  | Wind Tre               | IT     |
| ITATM  | TIM                    | IT     |
| ESPVV  | Vodafone España        | ES     |
| DEUD1  | T-Mobile Deutschland   | DE     |
| GBRVF  | Vodafone UK            | GB     |

Pour la liste complète, consultez `src/data/operator-mapping.ts`.

## Ajouter un nouvel opérateur

Éditez `src/data/operator-mapping.ts`:

```typescript
export const OPERATOR_DATABASE: Record<string, Operator> = {
  // ... opérateurs existants ...

  "XXXXX": {
    code: "XXXXX",
    name: "Nom de l'opérateur",
    country: "Pays",
    countryCode: "XX",
    mcc: "123",
    mnc: "45",
  },
};
```

## Dépannage Rapide

### Problème: Aucun opérateur détecté

**Solution**:
- Vérifiez que les SIMs ont eu une activité récente (7 derniers jours)
- Vérifiez les credentials dans `.env`

### Problème: Erreur d'authentification

**Solution**:
- Vérifiez que les credentials sont corrects
- Vérifiez que les APIs sont accessibles

### Problème: Codes opérateurs "UNKNOWN"

**Solution**:
- Ajoutez les codes manquants dans `operator-mapping.ts`
- Consultez `stats.unknownOperators` pour la liste

## Pour aller plus loin

Consultez la documentation complète: `docs/SIM_OPERATOR_DETECTION.md`
