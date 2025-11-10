/**
 * Exemples de tests pour la fonction Lambda FleetWatcherFlespiAssets
 */

const handler = require('./index.js');

const examples = {

  // 1. Synchroniser un asset Client
  syncClient: {
    action: 'sync_client_asset',
    input: {
      clientData: {
        id: 'company-test-123',
        name: 'Transport Express SARL',
        siret: '12345678901234',
        email: 'contact@transport-express.fr',
        phone: '0123456789'
      }
    }
  },

  // 2. Synchroniser un asset Véhicule
  syncVehicle: {
    action: 'sync_vehicle_asset',
    input: {
      vehicleData: {
        immat: 'AB-123-CD',
        nomVehicule: 'Camion 1',
        VIN: '1HGBH41JXMN109186',
        marque: 'Renault',
        AWN_model: 'Master',
        vehicleDeviceImei: '123456789012345'
      },
      createInterval: true
    }
  },

  // 3. Synchroniser un asset Chauffeur
  syncDriver: {
    action: 'sync_driver_asset',
    input: {
      driverData: {
        sub: 'driver-test-456',
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean.dupont@example.com',
        mobile: '0612345678'
      }
    }
  },

  // 4. Créer un intervalle
  createInterval: {
    action: 'create_device_interval',
    input: {
      assetId: 12345,
      deviceImei: '123456789012345',
      meta: {
        vehicle_immat: 'AB-123-CD'
      }
    }
  },

  // 5. Fermer un intervalle
  closeInterval: {
    action: 'close_device_interval',
    input: {
      assetId: 12345
    }
  }
};

async function runTest(testName) {
  console.log(`\n========================================`);
  console.log(`TEST: ${testName}`);
  console.log(`========================================\n`);

  const event = examples[testName];
  if (!event) {
    console.error(`❌ Test "${testName}" introuvable`);
    return;
  }

  console.log('📤 Event:');
  console.log(JSON.stringify(event, null, 2));
  console.log('\n');

  try {
    const result = await handler.handler(event);
    console.log('✅ Résultat:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Erreur:');
    console.error(error);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\n📋 Tests disponibles:\n');
    Object.keys(examples).forEach((key, index) => {
      console.log(`${index + 1}. ${key}`);
    });
    console.log('\n💡 Usage: node test-examples.js <testName>\n');
    return;
  }

  await runTest(args[0]);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { examples, runTest };
