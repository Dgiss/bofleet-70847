# Intégration Flespi Assets - FleetWatcher

## 📋 Vue d'ensemble

Cette documentation décrit l'intégration des **Assets Flespi** dans FleetWatcher, permettant d'historiser les associations entre les boîtiers GPS (devices) et les entités métier (Clients, Véhicules, Chauffeurs).

## 🎯 Objectif

Remplacer la gestion d'associations actuellement limitée de FleetWatcher par une solution robuste utilisant les **Assets Flespi** pour:

- ✅ **Historiser** toutes les associations device ↔ véhicule/chauffeur/client
- ✅ **Tracer** les changements de boîtiers au fil du temps
- ✅ **Enrichir** les rapports avec les informations contextuelles
- ✅ **Maintenir** un historique complet même après changement de boîtier

## 🏗️ Architecture

### Composants créés

```
📦 amplify/backend/function/FleetWatcherFlespiAssets/
├── src/
│   ├── index.js              # Handler Lambda principal
│   ├── flespi-client.js      # Client API Flespi
│   ├── asset-handlers.js     # Gestionnaires par type d'asset
│   └── package.json
├── README.md                  # Documentation détaillée
├── parameters.json
└── FleetWatcherFlespiAssets-cloudformation-template.json

📝 Schema GraphQL mis à jour:
├── Ajout de flespiAssetId sur Company, Vehicle, Driver
├── Nouvelle mutation: manageFlespiAsset
└── Nouveaux types: FlespiAssetResponse, FlespiAssetAction
```

## 📊 Modèles mis à jour

### Company, Vehicle, Driver

```graphql
type Company {
  # ... champs existants
  flespiAssetId: Int  # 🆕 ID de l'asset Flespi
}

type Vehicle {
  # ... champs existants
  flespiAssetId: Int  # 🆕 ID de l'asset Flespi
}

type Driver {
  # ... champs existants
  flespiAssetId: Int  # 🆕 ID de l'asset Flespi
}
```

## 🚀 Utilisation rapide

### 1. Synchroniser un véhicule avec Flespi

```graphql
mutation SyncVehicle {
  manageFlespiAsset(
    action: sync_vehicle_asset
    input: {
      vehicleData: {
        immat: "AB-123-CD"
        nomVehicule: "Camion 1"
        vehicleDeviceImei: "123456789012345"
        # ... autres champs
      }
      createInterval: true  # Créer l'intervalle automatiquement
    }
  ) {
    success
    message
    assetId      # À sauvegarder dans Vehicle.flespiAssetId
    intervalId
  }
}
```

### 2. Synchroniser un chauffeur

```graphql
mutation SyncDriver {
  manageFlespiAsset(
    action: sync_driver_asset
    input: {
      driverData: {
        sub: "driver-123"
        firstname: "Jean"
        lastname: "Dupont"
        # ... autres champs
      }
    }
  ) {
    success
    message
    assetId  # À sauvegarder dans Driver.flespiAssetId
  }
}
```

### 3. Gérer les intervalles device

```graphql
# Créer un intervalle (associer un device à un asset)
mutation CreateInterval {
  manageFlespiAsset(
    action: create_device_interval
    input: {
      assetId: 12345
      deviceImei: "123456789012345"
      meta: {
        vehicle_immat: "AB-123-CD"
        reason: "Installation boîtier"
      }
    }
  ) {
    success
    intervalId
  }
}

# Fermer un intervalle (dissocier un device)
mutation CloseInterval {
  manageFlespiAsset(
    action: close_device_interval
    input: {
      assetId: 12345
    }
  ) {
    success
  }
}
```

## 🔄 Workflows d'intégration

### Scénario A: Création d'un véhicule

```javascript
// 1. Créer le véhicule dans DynamoDB
const vehicle = await API.graphql({
  query: createVehicle,
  variables: {
    input: {
      immat: "AB-123-CD",
      vehicleDeviceImei: "123456789012345",
      // ...
    }
  }
});

// 2. Synchroniser avec Flespi (crée asset + intervalle)
const flespiResult = await API.graphql({
  query: manageFlespiAsset,
  variables: {
    action: "sync_vehicle_asset",
    input: {
      vehicleData: vehicle.data.createVehicle,
      createInterval: true
    }
  }
});

// 3. Mettre à jour le véhicule avec l'assetId
await API.graphql({
  query: updateVehicle,
  variables: {
    input: {
      immat: "AB-123-CD",
      flespiAssetId: flespiResult.data.manageFlespiAsset.assetId
    }
  }
});
```

### Scénario B: Changement de véhicule pour un device

```javascript
// 1. Fermer l'intervalle sur l'ancien véhicule
await API.graphql({
  query: manageFlespiAsset,
  variables: {
    action: "close_device_interval",
    input: { assetId: oldVehicle.flespiAssetId }
  }
});

// 2. Créer nouvel intervalle sur nouveau véhicule
await API.graphql({
  query: manageFlespiAsset,
  variables: {
    action: "create_device_interval",
    input: {
      assetId: newVehicle.flespiAssetId,
      deviceImei: "123456789012345"
    }
  }
});
```

## 🔧 Configuration requise

### Variables d'environnement

La fonction Lambda nécessite:

```bash
FLESPI_TOKEN=<votre-token-flespi>
```

**⚠️ Important**: Configurer le token via:
1. AWS Systems Manager Parameter Store (recommandé)
2. AWS Secrets Manager
3. Variables d'environnement CloudFormation

### Déploiement

```bash
# 1. Pousser les changements Amplify
amplify push

# 2. Vérifier le déploiement de la Lambda
amplify status

# 3. Configurer le token Flespi dans la console AWS
```

## 📝 Actions disponibles

| Action | Description | Input requis |
|--------|-------------|--------------|
| `sync_client_asset` | Synchronise un asset Client | `clientData` |
| `sync_vehicle_asset` | Synchronise un asset Véhicule | `vehicleData` |
| `sync_driver_asset` | Synchronise un asset Chauffeur | `driverData` |
| `create_device_interval` | Crée intervalle device ↔ asset | `assetId`, `deviceImei` |
| `close_device_interval` | Ferme un intervalle | `assetId` |

## 🎨 Types d'assets

### 1. Asset Client
- Représente une entreprise/client
- Stocke: SIRET, coordonnées, adresse
- Utilisé pour: facturation, rapports globaux

### 2. Asset Véhicule
- Représente un véhicule
- Stocke: immatriculation, VIN, marque, modèle
- Utilisé pour: historique véhicule, rapports

### 3. Asset Chauffeur
- Représente un conducteur
- Stocke: permis, coordonnées, clé iButton
- Utilisé pour: rapports conducteur, attribution trajets

## 📚 Documentation complète

- 📖 [README Lambda détaillé](../amplify/backend/function/FleetWatcherFlespiAssets/README.md)
- 🌐 [Documentation Flespi Assets](https://flespi.com/kb/assets-and-containers)
- 🔗 [API Flespi Reference](https://flespi.io/docs/#/gw/asset)

## ⚠️ Points d'attention

### Migration des données existantes

Pour les entités existantes dans DynamoDB:

```javascript
// Script de migration à exécuter
async function migrateExistingEntities() {
  // 1. Récupérer tous les véhicules sans flespiAssetId
  const vehicles = await listVehicles({
    filter: { flespiAssetId: { attributeExists: false } }
  });

  // 2. Pour chaque véhicule, créer l'asset Flespi
  for (const vehicle of vehicles) {
    const result = await manageFlespiAsset({
      action: "sync_vehicle_asset",
      input: { vehicleData: vehicle, createInterval: true }
    });

    // 3. Mettre à jour le véhicule
    await updateVehicle({
      immat: vehicle.immat,
      flespiAssetId: result.assetId
    });
  }
}
```

### Gestion des erreurs

La Lambda retourne toujours:
```json
{
  "success": true|false,
  "message": "Description",
  "assetId": 123,
  "intervalId": 456
}
```

Vérifier `success` avant de continuer!

### Historique

⚠️ **NE JAMAIS** supprimer les assets ou intervalles → Perte d'historique!

Pour désactiver un asset, fermer simplement son intervalle actif.

## 🔍 Monitoring

### CloudWatch Logs

Groupe de logs: `/aws/lambda/FleetWatcherFlespiAssets-{env}`

### Métriques à surveiller

- Taux de succès des synchronisations
- Temps d'exécution moyen
- Erreurs API Flespi (rate limiting, timeouts)

## 🚀 Prochaines étapes

1. ✅ **Déployer** la fonction Lambda via `amplify push`
2. ✅ **Configurer** le token Flespi dans AWS
3. ✅ **Tester** les mutations GraphQL
4. 🔜 **Migrer** les entités existantes
5. 🔜 **Intégrer** dans l'UI FleetWatcher
6. 🔜 **Automatiser** les synchronisations (DynamoDB Streams)

## 💡 Optimisations futures

- **DynamoDB Streams**: Synchronisation automatique à chaque changement
- **EventBridge**: Notifications sur changements d'association
- **Batch Processing**: Synchronisation en masse via SQS
- **Cache**: Redis pour réduire les appels Flespi

## 🆘 Support

Pour toute question ou problème:
1. Consulter les logs CloudWatch
2. Vérifier la [documentation Flespi](https://flespi.com/kb/)
3. Contacter l'équipe de développement

---

**Version**: 1.0.0
**Date**: 2025-11-10
**Auteur**: FleetWatcher Team
