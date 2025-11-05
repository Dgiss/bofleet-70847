# État de l'intégration des APIs IoT

## ✅ Things Mobile - FONCTIONNEL

**Status** : ✅ Opérationnel
**Configuration** : Complète
**Documentation** : Complète

L'API Things Mobile fonctionne correctement avec les credentials configurés.

---

## ⚠️ Phenix - ERREUR 403 FORBIDDEN

**Status** : ❌ Erreur d'autorisation (403 Forbidden)
**Documentation** : ✅ Reçue et implémentée
**Configuration** : Credentials configurés

### Problème
L'authentification réussit (200 OK, access_token reçu), mais l'endpoint `/GsmApi/V2/GetInfoSimList` retourne une erreur 403 (Interdit).

### Documentation Officielle
Endpoint confirmé par la documentation Phenix :
```
POST https://api.phenix-partner.fr/Auth/authenticate
```

Endpoints disponibles :
- ✅ `/Auth/authenticate` - Authentification (confirmé)
- ✅ `/GsmApi/V2/GetInfoSimList` - Liste des SIMs (confirmé)
- ✅ `/GsmApi/V2/MsisdnConsult` - Statut d'une ligne (confirmé)
- ✅ `/GsmApi/V2/SdtrConso` - Consommation temps réel (confirmé)
- ✅ `/GsmApi/GetConsoMsisdnFromCDR` - Historique consommation (confirmé)

### Page de diagnostic créée
Une page de test dédiée a été créée : `/phenix-test`

Cette page permet de :
- Tester uniquement l'authentification Phenix
- Voir la réponse complète de l'API
- Diagnostiquer l'erreur 401 en détail

### Actions à faire
1. **Accédez à** `http://localhost:8080/phenix-test`
2. **Cliquez sur** "Tester l'authentification"
3. **Ouvrez la console** du navigateur (F12)
4. **Partagez** la réponse complète affichée

### Pour débugger
Ouvrez la console du navigateur et testez l'API Phenix depuis `/api-diagnostic`. Les logs détaillés vous indiqueront :
- L'URL appelée
- Les données envoyées
- La réponse exacte du serveur

---

## ✅ Truphone - FONCTIONNEL

**Status** : ✅ Opérationnel (50 SIMs récupérées)
**Documentation** : ✅ Reçue et implémentée (OpenAPI v2.2)
**Configuration** : Complète

### Changements effectués
La documentation OpenAPI complète a été reçue et implémentée.

### Configuration corrigée
```
Base URL: https://iot.truphone.com/api
API Version: v2.2
Authentication: Token [api_key]
```

### Endpoints configurés
- ✅ `/api/v2.2/sims` - Liste des SIMs
- ✅ `/api/v2.2/sims/{iccid}` - Détails d'une SIM
- ✅ `/api/v2.2/sims/{iccid}/data_usage` - Consommation data

### Corrections appliquées
1. **URL de base** : `https://api.truphone.com` → `https://iot.truphone.com`
2. **Authentification** : `Bearer {token}` → `Token {token}`
3. **Endpoints** : `/v1/sims` → `/api/v2.2/sims`
4. **Proxy Vite** : Mis à jour pour pointer vers `iot.truphone.com`

### Test effectué ✅
Date: 4 Novembre 2025

**Résultat**: API fonctionnelle
- 50 SIMs récupérées avec succès
- Authentification Token correcte
- Endpoints v2.2 validés

---

## 🔧 Configuration actuelle

### Fichier `.env`
```env
# Things Mobile - ✅ FONCTIONNE
VITE_THINGSMOBILE_USERNAME=support@geoloc-systems.com
VITE_THINGSMOBILE_TOKEN=***configured***

# Phenix - ⚠️ ERREUR 401
VITE_PHENIX_USERNAME=c.noel@geoloc-systems.com
VITE_PHENIX_PASSWORD=***configured***

# Truphone - ❌ ERREUR 404
VITE_TRUPHONE_API_KEY=***configured***
VITE_TRUPHONE_PASSWORD=***configured***
```

### Proxies configurés (vite.config.ts)
```typescript
'/api/thingsmobile' → 'https://api.thingsmobile.com' ✅
'/api/phenix' → 'https://api.phenix-partner.fr' ⚠️ (403 sur GetInfoSimList)
'/api/truphone' → 'https://iot.truphone.com' ✅
```

---

## 📝 Recommandations

### Pour Phenix (Erreur 403)
1. **Authentification fonctionne** : Le token est bien récupéré
2. **Problème de permissions** : Le compte n'a pas les droits d'accès à `/GsmApi/V2/GetInfoSimList`

**Actions requises** :
1. Contactez votre représentant commercial Phenix
2. Demandez l'activation des permissions API pour :
   - `/GsmApi/V2/GetInfoSimList` (Liste des SIMs)
   - `/GsmApi/V2/MsisdnConsult` (Statut d'une ligne)
   - `/GsmApi/V2/SdtrConso` (Consommation temps réel)
3. Vérifiez que le compte `c.noel@geoloc-systems.com` a les droits API complets

### Pour Truphone
1. Accédez au portail développeur Truphone
2. Récupérez la documentation complète de l'API
3. Notez tous les endpoints disponibles
4. Vérifiez le format d'authentification (Bearer token, API Key, etc.)

### Test de diagnostic
Utilisez la page `/api-diagnostic` pour tester les connexions et voir les erreurs détaillées dans la console.

---

## 🚀 Prochaines étapes

1. **Obtenir la documentation officielle** de Phenix et Truphone
2. **Corriger les endpoints** basés sur la documentation réelle
3. **Tester** avec la page de diagnostic
4. **Activer** l'intégration complète une fois fonctionnel

---

## 📞 Support

Si vous avez besoin d'aide pour :
- Contacter Phenix ou Truphone
- Interpréter les erreurs
- Modifier le code d'intégration

Consultez les logs détaillés dans la console du navigateur ou partagez les messages d'erreur complets.
