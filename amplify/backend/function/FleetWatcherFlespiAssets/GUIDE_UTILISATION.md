# Guide d'utilisation - FleetWatcherFlespiAssets

## 🚀 Démarrage rapide

### Déployer la fonction Lambda

```bash
amplify push
```

La fonction sera déployée avec le token Flespi pré-configuré.

### Test local

```bash
cd amplify/backend/function/FleetWatcherFlespiAssets/src

# Lister les tests
node test-examples.js

# Exécuter un test
node test-examples.js syncVehicle
```

## 📝 Actions disponibles

### 1. sync_client_asset

Crée ou met à jour un asset Client.

```javascript
{
  action: 'sync_client_asset',
  input: {
    clientData: {
      id: "company-123",
      name: "Transport Express"
    }
  }
}
```

### 2. sync_vehicle_asset

Crée ou met à jour un asset Véhicule.

```javascript
{
  action: 'sync_vehicle_asset',
  input: {
    vehicleData: {
      immat: "AB-123-CD",
      vehicleDeviceImei: "123456789012345"
    },
    createInterval: true  // Crée l'intervalle automatiquement
  }
}
```

### 3. sync_driver_asset

Crée ou met à jour un asset Chauffeur.

```javascript
{
  action: 'sync_driver_asset',
  input: {
    driverData: {
      sub: "driver-123",
      firstname: "Jean",
      lastname: "Dupont"
    }
  }
}
```

### 4. create_device_interval

Crée un intervalle device ↔ asset.

```javascript
{
  action: 'create_device_interval',
  input: {
    assetId: 12345,
    deviceImei: "123456789012345"
  }
}
```

### 5. close_device_interval

Ferme un intervalle.

```javascript
{
  action: 'close_device_interval',
  input: {
    assetId: 12345
  }
}
```

## 📊 Format de réponse

```json
{
  "success": true|false,
  "message": "Description du résultat",
  "assetId": 12345,
  "intervalId": 456,
  "data": {}
}
```

## 🔄 Workflows typiques

### Création d'un véhicule

```javascript
// 1. Créer le véhicule dans DynamoDB
const vehicle = await createVehicle({...});

// 2. Synchroniser avec Flespi
const result = await syncVehicleAsset({
  vehicleData: vehicle,
  createInterval: true
});

// 3. Sauvegarder l'assetId
await updateVehicle({
  immat: vehicle.immat,
  flespiAssetId: result.assetId
});
```

### Changement de véhicule pour un device

```javascript
// 1. Fermer l'intervalle sur l'ancien véhicule
await closeDeviceInterval({
  assetId: oldVehicle.flespiAssetId
});

// 2. Créer un intervalle sur le nouveau véhicule
await createDeviceInterval({
  assetId: newVehicle.flespiAssetId,
  deviceImei: "123456789012345"
});
```

## 📚 Ressources

- [Documentation Flespi Assets](https://flespi.com/kb/assets-and-containers)
- [API Flespi Reference](https://flespi.io/docs/#/gw/asset)
- [README technique](./README.md)
