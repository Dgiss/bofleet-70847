# 🔋 Guide de Recharge des Cartes SIM

## Vue d'ensemble

Le système de recharge permet d'ajouter du crédit data aux cartes SIM des trois opérateurs IoT (Things Mobile, Phenix, Truphone).

**Date**: 4 Novembre 2025
**Version**: 1.0

---

## 🎯 Fonctionnalités

### 1. Recharge depuis l'interface principale

**Page**: `/sim-cards` → Onglet "🌐 Tous les opérateurs"

**Fonctionnement**:
1. Chaque ligne du tableau a un bouton "⚡ Recharger"
2. Cliquez sur le bouton pour ouvrir le dialogue de recharge
3. Saisissez le volume à recharger (MB)
4. Cliquez sur "Recharger"

**Caractéristiques**:
- ✅ Interface unifiée pour les 3 opérateurs
- ✅ Presets de volume (100, 500, 1000, 5000 MB)
- ✅ Indicateurs de statut (loading, succès, erreur)
- ✅ Avertissements selon l'opérateur

---

### 2. Page de test de recharge

**URL**: `http://localhost:8080/recharge-test`

**Fonctionnalités**:
- Test dédié pour chaque opérateur
- Saisie manuelle du MSISDN/ICCID
- Configuration du volume
- Logs détaillés de la requête
- Affichage de la réponse complète

**Utilité**: Débogage et validation des APIs de recharge

---

## 📡 État des APIs de Recharge

### ✅ Phenix - RECHARGE RÉELLE

**Endpoint**: `/GsmApi/V2/MsisdnAddDataRecharge`

**Méthode**: POST

**Corps de la requête**:
```json
{
  "msisdn": "33612345678",
  "volume": 1000
}
```

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Code**:
```typescript
export const rechargePhenixSim = async (
  msisdn: string,
  volume: number
): Promise<boolean> => {
  const token = await ensureAuthenticated();

  const response = await axios.post(
    `${BASE_URL}/GsmApi/V2/MsisdnAddDataRecharge`,
    { msisdn, volume },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.status === 200;
};
```

**Statut**: ✅ Fonction implémentée et testable

**Problème connu**: ⚠️ Erreur 403 si les permissions API ne sont pas activées pour le compte

---

### ⚠️ Things Mobile - SIMULATION

**Endpoint**: ❌ Aucun endpoint public de recharge

**Statut**: API de recharge non disponible publiquement

**Comportement actuel**:
- Simulation avec délai de 2 secondes
- Retourne toujours succès
- Affiche un avertissement "Recharge simulée"

**Code**:
```typescript
case "Things Mobile":
  console.log(`🔄 Recharge Things Mobile (simulée): ${sim.msisdn} - ${volumeNum} MB`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  success = true;
  setError("⚠️ Things Mobile: Recharge simulée (API non disponible)");
  break;
```

**Note**: Things Mobile peut avoir une API de recharge via leur portail web, mais elle n'est pas documentée publiquement dans leur Business API.

---

### ⚠️ Truphone - SIMULATION

**Endpoint**: ❓ À vérifier dans la documentation

**Statut**: API de recharge non encore implémentée

**Comportement actuel**:
- Simulation avec délai de 2 secondes
- Retourne toujours succès
- Affiche un avertissement "Recharge simulée"

**Code**:
```typescript
case "Truphone":
  console.log(`🔄 Recharge Truphone (simulée): ${sim.iccid} - ${volumeNum} MB`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  success = true;
  setError("⚠️ Truphone: Recharge simulée (API non disponible)");
  break;
```

**Pistes d'investigation**:
- Vérifier dans l'OpenAPI Truphone s'il existe un endpoint de recharge
- Endpoints possibles: `/api/v2.2/sims/{iccid}/add_data`, `/api/v2.2/sims/{iccid}/recharge`
- Contacter le support Truphone pour la documentation

---

## 🎨 Composants

### 1. RechargeSimDialog

**Fichier**: `src/components/dialogs/RechargeSimDialog.tsx`

**Props**:
```typescript
interface RechargeSimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sim: {
    msisdn: string;
    iccid: string;
    provider: string;
  } | null;
  onSuccess?: () => void;
}
```

**Fonctionnalités**:
- Affichage des infos de la SIM
- Saisie du volume
- Presets de volume (100, 500, 1000, 5000 MB)
- Avertissements selon l'opérateur
- Gestion des états (loading, success, error)

**Utilisation**:
```tsx
<RechargeSimDialog
  open={selectedSimForRecharge !== null}
  onOpenChange={(open) => !open && setSelectedSimForRecharge(null)}
  sim={selectedSimForRecharge}
  onSuccess={() => {
    refetch();
    toast({ title: "Recharge terminée" });
  }}
/>
```

---

### 2. MultiProviderSimTab (modifié)

**Fichier**: `src/components/sim/MultiProviderSimTab.tsx`

**Ajout**:
- Colonne "Actions" avec bouton "⚡ Recharger"
- État `selectedSimForRecharge`
- Intégration du dialogue de recharge

**Code ajouté**:
```typescript
{
  id: "actions",
  label: "Actions",
  sortable: false,
  renderCell: (value: any, row: any) => (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setSelectedSimForRecharge(row)}
      className="gap-2"
    >
      <Zap className="h-4 w-4" />
      Recharger
    </Button>
  ),
}
```

---

### 3. RechargeTestPage

**Fichier**: `src/pages/RechargeTestPage.tsx`

**URL**: `/recharge-test`

**Sections**:
1. **Configuration**: Sélection opérateur, MSISDN/ICCID, volume
2. **Avertissements**: Statut de l'API pour chaque opérateur
3. **Résultats**: Affichage détaillé de la réponse
4. **Instructions**: Guide d'utilisation

---

## 🧪 Comment Tester

### Test 1: Interface principale

1. Accédez à `http://localhost:8080/sim-cards`
2. Cliquez sur l'onglet "🌐 Tous les opérateurs"
3. Attendez le chargement des SIMs (500 Things Mobile + 50 Truphone)
4. Sur n'importe quelle ligne, cliquez sur "⚡ Recharger"
5. Dans le dialogue:
   - Vérifiez les infos de la SIM
   - Saisissez un volume (ex: 100 MB) ou utilisez un preset
   - Cliquez sur "Recharger"
6. Observez:
   - **Things Mobile / Truphone**: Succès avec avertissement "Recharge simulée"
   - **Phenix**: Erreur 403 (permissions manquantes)

**Logs attendus** (console F12):
```
🔄 Recharge Things Mobile (simulée): 33612345678 - 100 MB
✅ Recharge simulée
```

---

### Test 2: Page de test dédiée

1. Accédez à `http://localhost:8080/recharge-test`
2. Sélectionnez "Phenix"
3. Saisissez un MSISDN (ex: 33612345678)
4. Choisissez un volume (ex: 100 MB)
5. Cliquez sur "Lancer le test de recharge"
6. Observez:
   - **Console**: Logs détaillés de la requête
   - **Résultat**: Succès ou erreur avec détails

**Résultat attendu Phenix** (avec erreur 403):
```json
{
  "success": false,
  "message": "Request failed with status code 403",
  "provider": "Phenix",
  "msisdn": "33612345678",
  "volume": 100,
  "errorDetails": {
    "status": 403,
    "statusText": "Forbidden",
    "data": {...}
  }
}
```

---

### Test 3: Console du navigateur

1. Ouvrez la console (F12)
2. Effectuez une recharge
3. Vérifiez les logs détaillés:

**Things Mobile**:
```
=== TEST RECHARGE ===
Opérateur: Things Mobile
MSISDN: 33612345678
Volume: 100 MB
🔄 Simulation Things Mobile...
✅ Résultat: true Recharge Things Mobile simulée
```

**Phenix**:
```
=== TEST RECHARGE ===
Opérateur: Phenix
MSISDN: 33612345678
Volume: 100 MB
🔄 Appel API Phenix...
Phenix: Tentative d'authentification...
Phenix: Authentification réussie, token reçu
❌ Erreur: AxiosError { status: 403 }
```

---

## 🔧 Résolution de Problèmes

### Problème 1: Erreur 403 Phenix

**Symptôme**: La recharge Phenix échoue avec une erreur 403 Forbidden

**Cause**: Le compte Phenix n'a pas les permissions API pour `/GsmApi/V2/MsisdnAddDataRecharge`

**Solution**:
1. Contactez votre représentant commercial Phenix
2. Demandez l'activation des permissions API complètes
3. Vérifiez que le compte `c.noel@geoloc-systems.com` a accès aux endpoints:
   - `/GsmApi/V2/GetInfoSimList`
   - `/GsmApi/V2/MsisdnAddDataRecharge`
   - `/GsmApi/V2/MsisdnConsult`
   - `/GsmApi/V2/SdtrConso`

---

### Problème 2: Things Mobile ne recharge pas vraiment

**Symptôme**: Message "Recharge simulée" s'affiche

**Cause**: Things Mobile n'expose pas d'API publique de recharge dans leur Business API

**Solutions possibles**:
1. **Portail web**: Utiliser le portail Things Mobile pour recharger manuellement
2. **Contact commercial**: Demander l'accès à une API de recharge (si elle existe)
3. **API alternative**: Vérifier s'il existe un endpoint non documenté

**Workaround actuel**: Simulation pour les tests

---

### Problème 3: Truphone ne recharge pas vraiment

**Symptôme**: Message "Recharge simulée" s'affiche

**Cause**: Endpoint de recharge non encore identifié dans la documentation

**Actions à faire**:
1. Consulter la documentation OpenAPI Truphone complète
2. Rechercher les endpoints contenant "recharge", "topup", "add_data", "credit"
3. Tester les endpoints trouvés
4. Implémenter la fonction réelle si l'endpoint existe

**Code à ajouter** (exemple):
```typescript
// Dans TruphoneService.ts
export const rechargeTruphoneSim = async (
  iccid: string,
  volume: number
): Promise<boolean> => {
  const headers = await getHeaders();

  try {
    const response = await axios.post(
      `${BASE_URL}/v2.2/sims/${iccid}/add_data`,
      { volume },
      { headers }
    );

    return response.status === 200;
  } catch (error) {
    console.error("Truphone recharge error:", error);
    return false;
  }
};
```

---

## 📊 Tableau Récapitulatif

| Opérateur | API Recharge | Status | Endpoint | Authentification |
|-----------|--------------|--------|----------|------------------|
| **Things Mobile** | ❌ Non disponible | Simulation | - | - |
| **Phenix** | ✅ Disponible | Erreur 403 | `/GsmApi/V2/MsisdnAddDataRecharge` | Bearer Token |
| **Truphone** | ❓ À vérifier | Simulation | `/api/v2.2/sims/{iccid}/???` | Token {api_key} |

---

## 🚀 Prochaines Étapes

### Court terme (Sprint actuel)
- [x] Implémenter le dialogue de recharge
- [x] Ajouter le bouton dans MultiProviderSimTab
- [x] Créer la page de test
- [ ] Résoudre l'erreur 403 Phenix (demander permissions API)

### Moyen terme
- [ ] Identifier l'endpoint de recharge Truphone
- [ ] Implémenter rechargeTruphoneSim()
- [ ] Tester la recharge réelle Truphone
- [ ] Contacter Things Mobile pour API de recharge

### Long terme
- [ ] Ajouter un historique des recharges
- [ ] Implémenter des alertes de seuil (recharge auto si < 10%)
- [ ] Dashboard de suivi des recharges par opérateur
- [ ] Export CSV des recharges effectuées

---

## 📞 Contacts Support

### Phenix
- **Support**: Via représentant commercial Geoloc Systems
- **Email**: c.noel@geoloc-systems.com
- **Problème actuel**: Permissions API manquantes (403)

### Things Mobile
- **Support**: support@thingsmobile.com
- **Portail**: https://portal.thingsmobile.com
- **Question**: API de recharge disponible?

### Truphone
- **Support**: Via portail client https://iot.truphone.com
- **Documentation**: https://iot.truphone.com/api/docs
- **Question**: Endpoint de recharge pour API v2.2?

---

## 📝 Changelog

### Version 1.0 (4 Nov 2025)
- ✅ Création du système de recharge
- ✅ Dialogue RechargeSimDialog
- ✅ Intégration dans MultiProviderSimTab
- ✅ Page de test RechargeTestPage
- ✅ Documentation complète

---

**Fin du guide**

Pour toute question, consulter le diagnostic complet dans `DIAGNOSTIC_COMPLET_APPLICATION.md`
