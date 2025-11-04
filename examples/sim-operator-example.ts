/**
 * Exemple d'utilisation du système de détection d'opérateurs pour les SIMs IoT
 *
 * Ce script démontre comment:
 * 1. Récupérer toutes les SIMs avec leurs opérateurs
 * 2. Afficher des statistiques
 * 3. Grouper les SIMs par opérateur
 * 4. Exporter les données
 */

import { SimOperatorService } from '../src/services/SimOperatorService';
import { OperatorDetectionService } from '../src/services/OperatorDetectionService';
import { getOperatorDisplayName } from '../src/data/operator-mapping';

/**
 * Fonction principale
 */
async function main() {
  console.log('='.repeat(60));
  console.log('SYSTÈME DE DÉTECTION D\'OPÉRATEURS - CARTES SIM IOT');
  console.log('='.repeat(60));
  console.log('');

  const service = SimOperatorService.getInstance();

  try {
    // 1. Récupérer toutes les SIMs avec leurs opérateurs
    console.log('📡 Récupération de toutes les SIMs...\n');
    const sims = await service.getAllSimsWithOperators();
    console.log(`✅ ${sims.length} SIMs récupérées\n`);

    // 2. Afficher les statistiques
    console.log('📊 Statistiques par opérateur:\n');
    const summary = await service.getOperatorSummary();

    summary.forEach((item, index) => {
      console.log(`${index + 1}. ${item.operatorName} (${item.country})`);
      console.log(`   Code: ${item.operatorCode}`);
      console.log(`   Nombre de SIMs: ${item.simCount}`);
      console.log(`   Plateformes:`);
      if (item.platforms.thingsmobile > 0) {
        console.log(`     - Things Mobile: ${item.platforms.thingsmobile}`);
      }
      if (item.platforms.phenix > 0) {
        console.log(`     - Phenix: ${item.platforms.phenix}`);
      }
      if (item.platforms.truphone > 0) {
        console.log(`     - Truphone: ${item.platforms.truphone}`);
      }
      console.log('');
    });

    // 3. Afficher quelques exemples de SIMs
    console.log('📋 Exemples de SIMs (5 premières):\n');
    sims.slice(0, 5).forEach((sim, index) => {
      const operatorName = sim.currentOperator?.operator?.name || 'Inconnu';
      const operatorCode = sim.currentOperator?.code || 'N/A';
      console.log(`${index + 1}. ${sim.msisdn || sim.iccid}`);
      console.log(`   Plateforme: ${sim.platform}`);
      console.log(`   Statut: ${sim.status}`);
      console.log(`   Opérateur: ${operatorName} (${operatorCode})`);
      if (sim.currentOperator?.country) {
        console.log(`   Pays: ${sim.currentOperator.country}`);
      }
      console.log('');
    });

    // 4. Grouper par opérateur
    console.log('🗂️  Groupement par opérateur:\n');
    const grouped = service.groupSimsByOperator(sims);
    grouped.forEach((group, code) => {
      const displayName = getOperatorDisplayName(code);
      console.log(`${displayName}: ${group.count} SIM(s)`);
    });
    console.log('');

    // 5. Statistiques globales
    const stats = await service.getOperatorStats();
    console.log('📈 Statistiques globales:\n');
    console.log(`Total de SIMs: ${stats.totalSims}`);
    console.log(`Nombre d'opérateurs différents: ${stats.byOperator.size}`);
    console.log(`Opérateurs non identifiés: ${stats.unknownOperators.length}`);
    if (stats.unknownOperators.length > 0) {
      console.log(`Codes inconnus: ${stats.unknownOperators.join(', ')}`);
    }
    console.log(`Dernière mise à jour: ${stats.lastUpdated.toLocaleString()}`);
    console.log('');

    // 6. Proposer des exports
    console.log('💾 Export des données:\n');
    console.log('Pour exporter au format JSON:');
    console.log('  const jsonData = await service.exportSimsByOperatorAsJson();');
    console.log('');
    console.log('Pour exporter au format CSV:');
    console.log('  const csvData = await service.exportSimsByOperatorAsCsv();');
    console.log('');

    // 7. Exemples de recherche
    console.log('🔍 Exemples de recherche:\n');

    // Recherche par opérateur (si on a des données)
    if (summary.length > 0) {
      const firstOperator = summary[0];
      console.log(`Recherche de SIMs pour ${firstOperator.operatorName}:`);
      const operatorSims = await service.findSimsByOperator(firstOperator.operatorCode);
      console.log(`  Trouvé: ${operatorSims.length} SIM(s)`);
      console.log('');
    }

    // Recherche par pays
    console.log('Recherche de SIMs en France (FR):');
    const frenchSims = await service.findSimsByCountry('FR');
    console.log(`  Trouvé: ${frenchSims.length} SIM(s)`);
    console.log('');

    // Recherche par plateforme
    console.log('Recherche de SIMs Things Mobile:');
    const tmSims = await service.findSimsByPlatform('thingsmobile');
    console.log(`  Trouvé: ${tmSims.length} SIM(s)`);
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ Analyse terminée avec succès');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Erreur lors de l\'exécution:');
    console.error(error.message);
    console.error('\nAssurez-vous que:');
    console.error('1. Les credentials sont configurés dans .env');
    console.error('2. Les APIs sont accessibles');
    console.error('3. Vous avez des SIMs dans au moins une plateforme');
  }
}

/**
 * Exemple de détection pour une seule SIM
 */
async function detectSingleSim(msisdn: string) {
  console.log(`\n🔍 Détection de l'opérateur pour ${msisdn}...\n`);

  const detectionService = OperatorDetectionService.getInstance();

  try {
    const operatorInfo = await detectionService.detectThingsMobileOperator(msisdn);

    if (operatorInfo) {
      console.log('✅ Opérateur détecté:');
      console.log(`   Code: ${operatorInfo.code}`);
      console.log(`   Nom: ${operatorInfo.operator?.name || 'Inconnu'}`);
      console.log(`   Pays: ${operatorInfo.country || 'N/A'}`);
      console.log(`   Dernière connexion: ${operatorInfo.lastSeen || 'N/A'}`);
    } else {
      console.log('⚠️  Aucun opérateur détecté');
      console.log('   La SIM n\'a peut-être pas eu d\'activité récente');
    }
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

/**
 * Exemple d'export JSON
 */
async function exportExample() {
  console.log('\n💾 Export des données...\n');

  const service = SimOperatorService.getInstance();

  try {
    // Export JSON
    const jsonData = await service.exportSimsByOperatorAsJson();
    console.log('📄 Données JSON générées');
    console.log(`   Taille: ${jsonData.length} caractères`);

    // Vous pouvez sauvegarder dans un fichier ici
    // fs.writeFileSync('sims_by_operator.json', jsonData);

    // Export CSV
    const csvData = await service.exportSimsByOperatorAsCsv();
    console.log('📄 Données CSV générées');
    console.log(`   Taille: ${csvData.length} caractères`);

    // Vous pouvez sauvegarder dans un fichier ici
    // fs.writeFileSync('sims_by_operator.csv', csvData);

    console.log('\n✅ Export terminé');
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'export:', error.message);
  }
}

// Exécution
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n👋 Au revoir!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erreur fatale:', error);
      process.exit(1);
    });
}

// Exports pour utilisation dans d'autres scripts
export { main, detectSingleSim, exportExample };
