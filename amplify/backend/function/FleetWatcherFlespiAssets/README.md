# FleetWatcher - Flespi Assets Lambda Functions

Cette fonction Lambda gère la synchronisation des **Assets Flespi** pour FleetWatcher, permettant de maintenir un historique complet des associations entre devices GPS et entités (Clients, Véhicules, Chauffeurs).

## 📋 Vue d'ensemble

### Qu'est-ce qu'un Asset Flespi ?

Un **asset** est une entité virtuelle dans Flespi qui représente un objet physique ou une ressource (véhicule, chauffeur, client, etc.) pouvant être suivie par un ou plusieurs boîtiers GPS au fil du temps.

**Avantages:**
- ✅ Historisation complète des associations device ↔ véhicule/chauffeur/client
- ✅ Traçabilité des changements de boîtiers
- ✅ Rapports enrichis avec informations contextuelles
- ✅ Approche "asset-centric" plutôt que "device-centric"

## 🏗️ Architecture

```
FleetWatcherFlespiAssets/
├── src/
│   ├── index.js              # Handler principal Lambda
│   ├── flespi-client.js      # Client API Flespi
│   ├── asset-handlers.js     # Logique métier pour chaque type d'asset
│   └── package.json
├── parameters.json
└── FleetWatcherFlespiAssets-cloudformation-template.json
```

## 🔧 Configuration

### Variables d'environnement

La fonction Lambda nécessite la variable d'environnement suivante:

- `FLESPI_TOKEN`: Token d'authentification Flespi (configuré dans CloudFormation)

### Déploiement

```bash
# 1. Push de la fonction vers Amplify
amplify push

# 2. Configurer le token Flespi dans les paramètres CloudFormation
# Via la console AWS ou en mettant à jour parameters.json
```

## 📝 Types d'Assets

La fonction gère **trois types d'assets**:

### 1. Asset Client
Représente une entreprise/client utilisant le système de géolocalisation.

**Métadonnées stockées:**
- ID client
- SIRET
- Coordonnées (email, téléphone, mobile)
- Adresse complète
- Date de souscription

### 2. Asset Véhicule
Représente un véhicule équipé d'un boîtier GPS.

**Métadonnées stockées:**
- Immatriculation
- VIN (Vehicle Identification Number)
- Marque, modèle, année
- Type de carburant
- Puissance fiscale/DIN
- Kilométrage
- IMEI du device associé

### 3. Asset Chauffeur
Représente un conducteur pouvant utiliser différents véhicules.

**Métadonnées stockées:**
- Nom complet
- Coordonnées (email, mobile)
- Numéro et type de permis de conduire
- Fonction
- Date d'embauche
- Clé chauffeur (iButton)

## 🚀 Utilisation via GraphQL

### Mutation principale

```graphql
mutation ManageFlespiAsset {
  manageFlespiAsset(
    action: FlespiAssetAction!
    input: AWSJSON!
  ) {
    success
    message
    assetId
    intervalId
    data
  }
}
```

### Actions disponibles

#### 1. Synchroniser un Asset Client

```graphql
mutation SyncClientAsset {
  manageFlespiAsset(
    action: sync_client_asset
    input: {
      clientData: {
        id: "123e4567-e89b-12d3-a456-426614174000"
        name: "Transport Express SARL"
        siret: "12345678901234"
        email: "contact@transport-express.fr"
        phone: "0123456789"
        address: "10 rue des Lilas"
        postalCode: "75001"
        city: "Paris"
        countryCode: "FR"
        flespiAssetId: 12345  # Optionnel, pour mise à jour
      }
    }
  ) {
    success
    message
    assetId
  }
}
```

#### 2. Synchroniser un Asset Véhicule

```graphql
mutation SyncVehicleAsset {
  manageFlespiAsset(
    action: sync_vehicle_asset
    input: {
      vehicleData: {
        immat: "AB-123-CD"
        nomVehicule: "Camion 1"
        VIN: "1HGBH41JXMN109186"
        marque: "Renault"
        AWN_model: "Master"
        year: "2023"
        fuelType: "Diesel"
        vehicleDeviceImei: "123456789012345"
        companyVehiclesId: "company-123"
        flespiAssetId: 12346  # Optionnel, pour mise à jour
      }
      createInterval: true  # Créer automatiquement l'intervalle device
    }
  ) {
    success
    message
    assetId
    intervalId
  }
}
```

#### 3. Synchroniser un Asset Chauffeur

```graphql
mutation SyncDriverAsset {
  manageFlespiAsset(
    action: sync_driver_asset
    input: {
      driverData: {
        sub: "driver-sub-123"
        firstname: "Jean"
        lastname: "Dupont"
        email: "jean.dupont@example.com"
        mobile: "0612345678"
        drivingLicenseNumber: "1234567890"
        drivingLicenseType: "C"
        job: "Chauffeur routier"
        hiringDate: "2020-01-15"
        driverKey: "0123456789ABCDEF"
        companyDriversId: "company-123"
        flespiAssetId: 12347  # Optionnel, pour mise à jour
      }
    }
  ) {
    success
    message
    assetId
  }
}
```

#### 4. Créer un Intervalle Device ↔ Asset

```graphql
mutation CreateDeviceInterval {
  manageFlespiAsset(
    action: create_device_interval
    input: {
      assetId: 12346
      deviceImei: "123456789012345"
      begin: 1609459200  # Timestamp Unix (optionnel, défaut: maintenant)
      end: 0             # 0 = intervalle ouvert (pas de fin)
      meta: {
        vehicle_immat: "AB-123-CD"
        company_id: "company-123"
        reason: "Installation du boîtier"
      }
    }
  ) {
    success
    message
    intervalId
  }
}
```

#### 5. Fermer un Intervalle

```graphql
mutation CloseDeviceInterval {
  manageFlespiAsset(
    action: close_device_interval
    input: {
      assetId: 12346
      intervalId: 456     # Optionnel, ferme l'intervalle actif si non fourni
      endTimestamp: 1609545600  # Optionnel, défaut: maintenant
    }
  ) {
    success
    message
    intervalId
  }
}
```

## 🔄 Workflow d'intégration

### Scénario 1: Création d'un véhicule avec device

```javascript
// 1. Créer le véhicule dans DynamoDB (via mutation Amplify)
const vehicle = await createVehicle({
  immat: "AB-123-CD",
  vehicleDeviceImei: "123456789012345",
  // ... autres champs
});

// 2. Synchroniser l'asset Flespi avec intervalle automatique
const result = await manageFlespiAsset({
  action: "sync_vehicle_asset",
  input: {
    vehicleData: vehicle,
    createInterval: true
  }
});

// 3. Mettre à jour le véhicule avec l'ID de l'asset
await updateVehicle({
  immat: "AB-123-CD",
  flespiAssetId: result.assetId
});
```

### Scénario 2: Changement de véhicule pour un device

```javascript
// 1. Fermer l'intervalle actuel sur l'ancien véhicule
await manageFlespiAsset({
  action: "close_device_interval",
  input: {
    assetId: oldVehicleAssetId
  }
});

// 2. Créer un nouvel intervalle sur le nouveau véhicule
await manageFlespiAsset({
  action: "create_device_interval",
  input: {
    assetId: newVehicleAssetId,
    deviceImei: "123456789012345"
  }
});
```

## 📊 Schéma de base de données

Les champs suivants ont été ajoutés aux modèles existants:

```graphql
type Company {
  # ... champs existants
  flespiAssetId: Int
}

type Vehicle {
  # ... champs existants
  flespiAssetId: Int
}

type Driver {
  # ... champs existants
  flespiAssetId: Int
}
```

## 🔍 API Flespi utilisée

### Endpoints

- **POST** `/gw/assets` - Créer un asset
- **PUT** `/gw/assets/{id}` - Mettre à jour un asset
- **GET** `/gw/assets/{id}` - Récupérer un asset
- **DELETE** `/gw/assets/{id}` - Supprimer un asset
- **POST** `/gw/assets/{id}/intervals` - Créer un intervalle
- **PUT** `/gw/assets/{id}/intervals/{interval_id}` - Mettre à jour un intervalle
- **GET** `/gw/assets/{id}/intervals` - Lister les intervalles

### Documentation
- [Flespi Assets Documentation](https://flespi.com/kb/assets-and-containers)
- [Flespi API Reference](https://flespi.io/docs/#/gw/asset)

## 🛠️ Développement local

### Tests

```bash
# Tester le client Flespi
node -e "
const FlespiClient = require('./src/flespi-client.js');
const client = new FlespiClient('YOUR_FLESPI_TOKEN');

client.getAsset(12345).then(console.log).catch(console.error);
"
```

### Debug

Les logs sont automatiquement envoyés vers CloudWatch Logs:
- Groupe: `/aws/lambda/FleetWatcherFlespiAssets-{env}`
- Stream: Par invocation

## 🚨 Gestion d'erreurs

La fonction Lambda retourne toujours une structure cohérente:

```json
{
  "success": true|false,
  "message": "Message descriptif",
  "assetId": 12345,
  "intervalId": 456,
  "data": { /* Données supplémentaires */ }
}
```

**Erreurs courantes:**
- ❌ `FLESPI_TOKEN non configuré` → Vérifier les variables d'environnement
- ❌ `Asset introuvable` → L'asset a été supprimé ou l'ID est incorrect
- ❌ `Erreur de connexion à Flespi` → Problème réseau ou token invalide
- ❌ `Action inconnue` → Action non supportée

## 📚 Ressources

- [Documentation Flespi Assets](https://flespi.com/kb/assets-and-containers)
- [Documentation AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [Documentation Amplify Functions](https://docs.amplify.aws/cli/function/)

## 📝 Notes importantes

1. **Token Flespi**: Le token doit avoir les permissions nécessaires pour gérer les assets et intervalles
2. **Rate Limiting**: Respecter les limites de l'API Flespi (voir documentation)
3. **Timeout**: La Lambda est configurée avec un timeout de 60 secondes
4. **Idempotence**: Les opérations de synchronisation sont idempotentes (safe to retry)
5. **Historique**: Ne jamais supprimer les assets ou intervalles pour conserver l'historique complet

## 🔐 Sécurité

- Le token Flespi est stocké de manière sécurisée dans les variables d'environnement
- Les appels API utilisent HTTPS uniquement
- Les logs ne contiennent pas d'informations sensibles
- IAM Role avec permissions minimales (principe du moindre privilège)
