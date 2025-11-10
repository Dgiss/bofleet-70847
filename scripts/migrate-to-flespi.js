#!/usr/bin/env node

/**
 * Script de migration pour synchroniser les entités DynamoDB vers Flespi Assets
 *
 * Ce script :
 * 1. Lit toutes les Companies, Vehicles et Drivers de DynamoDB
 * 2. Crée les assets Flespi correspondants
 * 3. Met à jour DynamoDB avec les flespiAssetId
 *
 * Usage:
 *   node scripts/migrate-to-flespi.js
 *   node scripts/migrate-to-flespi.js --dry-run    # Test sans modifier DynamoDB
 *   node scripts/migrate-to-flespi.js --type=vehicle  # Migrer uniquement les véhicules
 */

const AWS = require('aws-sdk');
const https = require('https');

// Configuration
const FLESPI_TOKEN = 'wlIQBVXQBZkOHhLvZ4t6bzmHIr47kIkERSiiB3W0S7EqceJZ82T7s5FYlzVt53XM';
const REGION = process.env.AWS_REGION || 'eu-west-1';
const ENV = process.env.ENV || 'dev';

// Arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const typeArg = args.find(arg => arg.startsWith('--type='));
const migrationType = typeArg ? typeArg.split('=')[1] : 'all'; // all, company, vehicle, driver

// DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: REGION });

// Tables DynamoDB (format Amplify)
const TABLES = {
  company: `Company-${ENV}`,
  vehicle: `Vehicle-${ENV}`,
  driver: `Driver-${ENV}`
};

console.log('🚀 Migration vers Flespi Assets');
console.log('================================');
console.log(`Région AWS: ${REGION}`);
console.log(`Environnement: ${ENV}`);
console.log(`Mode: ${isDryRun ? 'DRY RUN (simulation)' : 'PRODUCTION'}`);
console.log(`Type: ${migrationType}`);
console.log('');

// ============================================================================
// Client Flespi
// ============================================================================

class FlespiClient {
  constructor(token) {
    this.token = token;
  }

  async request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'flespi.io',
        path: path,
        method: method,
        headers: {
          'Authorization': `FlespiToken ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject({ statusCode: res.statusCode, message: response.errors || response });
            }
          } catch (error) {
            reject({ statusCode: res.statusCode, message: 'JSON parse error', error });
          }
        });
      });

      req.on('error', (error) => reject({ message: 'Connection error', error }));
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async createAsset(assetData) {
    return await this.request('POST', '/gw/assets', {
      name: assetData.name,
      meta: assetData.meta || {}
    });
  }

  async createInterval(assetId, deviceImei, meta = {}) {
    return await this.request('POST', `/gw/assets/${assetId}/intervals`, {
      begin: Math.floor(Date.now() / 1000),
      end: 0,
      device_id: parseInt(deviceImei),
      meta: meta
    });
  }
}

// ============================================================================
// Fonctions de migration
// ============================================================================

async function scanTable(tableName) {
  const items = [];
  let lastEvaluatedKey = null;

  do {
    const params = {
      TableName: tableName,
      ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
    };

    const result = await dynamodb.scan(params).promise();
    items.push(...result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

async function updateItemWithAssetId(tableName, key, assetId) {
  if (isDryRun) {
    console.log(`  [DRY-RUN] Mise à jour ${tableName} avec flespiAssetId=${assetId}`);
    return;
  }

  await dynamodb.update({
    TableName: tableName,
    Key: key,
    UpdateExpression: 'SET flespiAssetId = :assetId',
    ExpressionAttributeValues: {
      ':assetId': assetId
    }
  }).promise();
}

// ============================================================================
// Migration Companies
// ============================================================================

async function migrateCompanies() {
  console.log('📦 Migration des Companies...\n');

  const companies = await scanTable(TABLES.company);
  console.log(`  Trouvé ${companies.length} companies\n`);

  const client = new FlespiClient(FLESPI_TOKEN);
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const company of companies) {
    try {
      // Skip si déjà migré
      if (company.flespiAssetId) {
        console.log(`  ⏭️  ${company.name || company.id} - Déjà migré (assetId: ${company.flespiAssetId})`);
        skipped++;
        continue;
      }

      // Créer l'asset
      const assetData = {
        name: `Client: ${company.name || company.id}`,
        meta: {
          type: 'client',
          client_id: company.id,
          siret: company.siret || '',
          email: company.email || '',
          phone: company.phone || '',
          mobile: company.mobile || '',
          address: company.address || '',
          postal_code: company.postalCode || '',
          city: company.city || '',
          country_code: company.countryCode || '',
          subscription_date: company.subscriptionDate || '',
          last_update: new Date().toISOString()
        }
      };

      if (isDryRun) {
        console.log(`  [DRY-RUN] Création asset: ${assetData.name}`);
        created++;
      } else {
        const result = await client.createAsset(assetData);
        const assetId = result.result && result.result[0] ? result.result[0].id : null;

        if (assetId) {
          await updateItemWithAssetId(TABLES.company, { id: company.id }, assetId);
          console.log(`  ✅ ${company.name || company.id} - Asset créé (ID: ${assetId})`);
          created++;
        }
      }

      // Petit délai pour ne pas surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ ${company.name || company.id} - Erreur:`, error.message);
      errors++;
    }
  }

  console.log(`\n  Résumé: ${created} créés, ${skipped} ignorés, ${errors} erreurs\n`);
}

// ============================================================================
// Migration Vehicles
// ============================================================================

async function migrateVehicles() {
  console.log('🚗 Migration des Vehicles...\n');

  const vehicles = await scanTable(TABLES.vehicle);
  console.log(`  Trouvé ${vehicles.length} vehicles\n`);

  const client = new FlespiClient(FLESPI_TOKEN);
  let created = 0;
  let skipped = 0;
  let errors = 0;
  let intervalsCreated = 0;

  for (const vehicle of vehicles) {
    try {
      // Skip si déjà migré
      if (vehicle.flespiAssetId) {
        console.log(`  ⏭️  ${vehicle.immat} - Déjà migré (assetId: ${vehicle.flespiAssetId})`);
        skipped++;
        continue;
      }

      // Créer l'asset
      const assetData = {
        name: `Véhicule: ${vehicle.immat || vehicle.nomVehicule || 'N/A'}`,
        meta: {
          type: 'vehicle',
          immatriculation: vehicle.immat,
          nom_vehicule: vehicle.nomVehicule || '',
          vin: vehicle.VIN || '',
          marque: vehicle.marque || '',
          modele: vehicle.AWN_model || '',
          year: vehicle.year || '',
          fuel_type: vehicle.fuelType || vehicle.energie || '',
          puissance_fiscale: vehicle.puissanceFiscale || '',
          puissance_din: vehicle.puissanceDin || '',
          kilometerage: vehicle.kilometerage || '',
          company_id: vehicle.companyVehiclesId || '',
          device_imei: vehicle.vehicleDeviceImei || '',
          last_update: new Date().toISOString()
        }
      };

      if (isDryRun) {
        console.log(`  [DRY-RUN] Création asset: ${assetData.name}`);
        if (vehicle.vehicleDeviceImei) {
          console.log(`    → Intervalle device ${vehicle.vehicleDeviceImei}`);
          intervalsCreated++;
        }
        created++;
      } else {
        const result = await client.createAsset(assetData);
        const assetId = result.result && result.result[0] ? result.result[0].id : null;

        if (assetId) {
          // Créer l'intervalle si un device est associé
          if (vehicle.vehicleDeviceImei) {
            try {
              await client.createInterval(assetId, vehicle.vehicleDeviceImei, {
                vehicle_immat: vehicle.immat,
                company_id: vehicle.companyVehiclesId
              });
              console.log(`  ✅ ${vehicle.immat} - Asset créé (ID: ${assetId}) + Intervalle device`);
              intervalsCreated++;
            } catch (intervalError) {
              console.log(`  ⚠️  ${vehicle.immat} - Asset créé (ID: ${assetId}) mais erreur intervalle`);
            }
          } else {
            console.log(`  ✅ ${vehicle.immat} - Asset créé (ID: ${assetId})`);
          }

          await updateItemWithAssetId(TABLES.vehicle, { immat: vehicle.immat }, assetId);
          created++;
        }
      }

      // Petit délai
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ ${vehicle.immat} - Erreur:`, error.message);
      errors++;
    }
  }

  console.log(`\n  Résumé: ${created} créés, ${intervalsCreated} intervalles, ${skipped} ignorés, ${errors} erreurs\n`);
}

// ============================================================================
// Migration Drivers
// ============================================================================

async function migrateDrivers() {
  console.log('👨‍✈️ Migration des Drivers...\n');

  const drivers = await scanTable(TABLES.driver);
  console.log(`  Trouvé ${drivers.length} drivers\n`);

  const client = new FlespiClient(FLESPI_TOKEN);
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const driver of drivers) {
    try {
      // Skip si déjà migré
      if (driver.flespiAssetId) {
        const fullname = driver.fullname || `${driver.firstname} ${driver.lastname}`;
        console.log(`  ⏭️  ${fullname} - Déjà migré (assetId: ${driver.flespiAssetId})`);
        skipped++;
        continue;
      }

      const fullname = driver.fullname || `${driver.firstname || ''} ${driver.lastname || ''}`.trim();

      // Créer l'asset
      const assetData = {
        name: `Chauffeur: ${fullname || driver.sub}`,
        meta: {
          type: 'driver',
          driver_sub: driver.sub,
          firstname: driver.firstname || '',
          lastname: driver.lastname || '',
          fullname: fullname,
          email: driver.email || '',
          mobile: driver.mobile || '',
          driving_license_number: driver.drivingLicenseNumber || '',
          driving_license_type: driver.drivingLicenseType || '',
          job: driver.job || '',
          hiring_date: driver.hiringDate || '',
          driver_key: driver.driverKey || '',
          company_id: driver.companyDriversId || '',
          last_update: new Date().toISOString()
        }
      };

      if (isDryRun) {
        console.log(`  [DRY-RUN] Création asset: ${assetData.name}`);
        created++;
      } else {
        const result = await client.createAsset(assetData);
        const assetId = result.result && result.result[0] ? result.result[0].id : null;

        if (assetId) {
          await updateItemWithAssetId(TABLES.driver, { sub: driver.sub }, assetId);
          console.log(`  ✅ ${fullname} - Asset créé (ID: ${assetId})`);
          created++;
        }
      }

      // Petit délai
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      const fullname = driver.fullname || `${driver.firstname} ${driver.lastname}`;
      console.error(`  ❌ ${fullname} - Erreur:`, error.message);
      errors++;
    }
  }

  console.log(`\n  Résumé: ${created} créés, ${skipped} ignorés, ${errors} erreurs\n`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    const startTime = Date.now();

    // Vérifier la connexion Flespi
    const client = new FlespiClient(FLESPI_TOKEN);
    try {
      await client.request('GET', '/gw/assets?count');
      console.log('✅ Connexion Flespi OK\n');
    } catch (error) {
      console.error('❌ Erreur de connexion Flespi:', error);
      process.exit(1);
    }

    // Migrer selon le type
    if (migrationType === 'all' || migrationType === 'company') {
      await migrateCompanies();
    }

    if (migrationType === 'all' || migrationType === 'vehicle') {
      await migrateVehicles();
    }

    if (migrationType === 'all' || migrationType === 'driver') {
      await migrateDrivers();
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Migration terminée en ${duration}s`);

    if (isDryRun) {
      console.log('\n⚠️  Mode DRY-RUN : Aucune modification n\'a été effectuée');
      console.log('   Relancez sans --dry-run pour effectuer la migration réelle');
    }

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Lancer la migration
main();
