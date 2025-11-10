# Scripts de migration Flespi

## migrate-to-flespi.js

Script de migration pour synchroniser les entités DynamoDB (Companies, Vehicles, Drivers) vers les Assets Flespi.

### Prérequis

```bash
npm install aws-sdk
```

### Configuration

1. **Configurer les credentials AWS:**

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="eu-west-1"
export ENV="dev"  # ou prod
```

2. **Vérifier les noms de tables:**

Le script utilise le format Amplify standard:
- `Company-{ENV}`
- `Vehicle-{ENV}`
- `Driver-{ENV}`

Si vos tables ont des noms différents, modifiez la constante `TABLES` dans le script.

### Utilisation

#### 1. Test en mode DRY-RUN (recommandé)

```bash
# Tester la migration sans modifier DynamoDB
node scripts/migrate-to-flespi.js --dry-run
```

Ce mode va :
- ✅ Lire toutes les données DynamoDB
- ✅ Créer les assets Flespi
- ❌ Ne PAS mettre à jour DynamoDB

#### 2. Migration réelle

```bash
# Migrer toutes les entités (Companies, Vehicles, Drivers)
node scripts/migrate-to-flespi.js
```

#### 3. Migration sélective

```bash
# Migrer uniquement les Companies
node scripts/migrate-to-flespi.js --type=company

# Migrer uniquement les Vehicles
node scripts/migrate-to-flespi.js --type=vehicle

# Migrer uniquement les Drivers
node scripts/migrate-to-flespi.js --type=driver
```

### Ce que fait le script

#### Pour chaque Company:
1. ✅ Crée un asset Flespi "Client: {name}"
2. ✅ Stocke les métadonnées (SIRET, email, téléphone, adresse)
3. ✅ Met à jour DynamoDB avec le `flespiAssetId`

#### Pour chaque Vehicle:
1. ✅ Crée un asset Flespi "Véhicule: {immat}"
2. ✅ Stocke les métadonnées (VIN, marque, modèle, etc.)
3. ✅ Si un device est associé (`vehicleDeviceImei`), crée l'intervalle automatiquement
4. ✅ Met à jour DynamoDB avec le `flespiAssetId`

#### Pour chaque Driver:
1. ✅ Crée un asset Flespi "Chauffeur: {fullname}"
2. ✅ Stocke les métadonnées (permis, email, mobile, etc.)
3. ✅ Met à jour DynamoDB avec le `flespiAssetId`

### Sécurité

- ⏭️ **Skip automatique** : Les entités déjà migrées (avec `flespiAssetId`) sont ignorées
- 🔄 **Idempotent** : Vous pouvez relancer le script sans risque
- ⏱️ **Rate limiting** : Délai de 100ms entre chaque création pour ne pas surcharger l'API Flespi

### Exemple de sortie

```
🚀 Migration vers Flespi Assets
================================
Région AWS: eu-west-1
Environnement: dev
Mode: PRODUCTION
Type: all

✅ Connexion Flespi OK

📦 Migration des Companies...

  Trouvé 3 companies

  ✅ Transport Express - Asset créé (ID: 12345)
  ✅ Logistique Plus - Asset créé (ID: 12346)
  ⏭️  Auto Service - Déjà migré (assetId: 12347)

  Résumé: 2 créés, 1 ignorés, 0 erreurs

🚗 Migration des Vehicles...

  Trouvé 15 vehicles

  ✅ AB-123-CD - Asset créé (ID: 12348) + Intervalle device
  ✅ EF-456-GH - Asset créé (ID: 12349)
  ⏭️  IJ-789-KL - Déjà migré (assetId: 12350)

  Résumé: 12 créés, 8 intervalles, 3 ignorés, 0 erreurs

👨‍✈️ Migration des Drivers...

  Trouvé 8 drivers

  ✅ Jean Dupont - Asset créé (ID: 12351)
  ✅ Marie Martin - Asset créé (ID: 12352)

  Résumé: 8 créés, 0 ignorés, 0 erreurs

✅ Migration terminée en 45.32s
```

### Gestion d'erreurs

Le script continue même en cas d'erreur sur une entité particulière. Les erreurs sont affichées mais n'arrêtent pas le processus complet.

```
  ❌ XX-000-XX - Erreur: Connection timeout
```

### Vérification post-migration

Après la migration, vérifiez sur Flespi:
1. Connectez-vous à https://flespi.io
2. Allez dans "Assets"
3. Vérifiez que vos véhicules/clients/chauffeurs sont présents

### Re-migration

Si vous devez re-migrer (par exemple après une erreur):

```bash
# Le script skip automatiquement les entités déjà migrées
node scripts/migrate-to-flespi.js
```

Pour forcer la re-migration d'une entité:
1. Supprimez manuellement le `flespiAssetId` dans DynamoDB
2. Relancez le script

### Troubleshooting

**Erreur: "Cannot find module 'aws-sdk'"**
```bash
npm install aws-sdk
```

**Erreur: "Access Denied"**
- Vérifiez vos credentials AWS
- Vérifiez que votre utilisateur AWS a les permissions DynamoDB nécessaires

**Erreur: "Table not found"**
- Vérifiez la variable `ENV`
- Vérifiez les noms de tables dans la console AWS

**Erreur: "Flespi token invalid"**
- Vérifiez le token dans le script
- Testez le token sur https://flespi.io

### Performance

- ~100-150 entités/minute (avec délai de 100ms)
- Pour 1000 véhicules: ~7-10 minutes
- Pour optimiser: Réduire le délai entre créations (risque de rate limiting)

### Logs

Les logs sont affichés en temps réel dans la console. Pour sauvegarder:

```bash
node scripts/migrate-to-flespi.js | tee migration.log
```
