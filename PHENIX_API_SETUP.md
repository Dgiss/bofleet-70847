# Configuration de l'API Phenix

## Variables d'environnement requises

Pour utiliser l'API Phenix, vous devez définir les variables d'environnement suivantes :

```env
VITE_PHENIX_USERNAME=c.noel@geoloc-systems.com
VITE_PHENIX_PASSWORD=fskDaifw2n4YzBc*
VITE_PHENIX_PARTENAIRE_ID=votre_partenaire_id
```

## Comment obtenir votre Partenaire ID ?

Le **Partenaire ID** est un identifiant unique (GUID) fourni par Phenix. Il est obligatoire pour tous les appels API.

### Méthode 1 : Portail Phenix
1. Connectez-vous au portail Phenix : https://partner.extranet-it.fr/login
2. Allez dans votre profil ou paramètres de compte
3. Votre Partenaire ID devrait être visible dans les informations de votre compte

### Méthode 2 : Contacter Phenix
Si vous ne trouvez pas votre Partenaire ID :
- Contactez votre représentant commercial Phenix
- Demandez votre **Partenaire ID (GUID)** pour l'utilisation de l'API

### Format du Partenaire ID
Le Partenaire ID est un GUID au format : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

Exemple : `41922e10-b309-46ef-b60b-4cade5b93446`

## Documentation API Phenix

### Authentification
L'authentification se fait en deux étapes :
1. Appel à `/Auth/authenticate` avec username et password
2. Récupération de l'`access_token` (Token JWT)
3. Utilisation du token Bearer dans les appels API suivants

**Note importante** : C'est bien l'`access_token` qui doit être utilisé, pas le `working_token`.

### Endpoints principaux

#### Liste des SIMs
```
GET https://api.phenix-partner.fr/GsmApi/V2/GetInfoSimList
Params: partenaireId
```

#### Consultation d'une ligne
```
GET https://api.phenix-partner.fr/GsmApi/V2/MsisdnConsult
Params: partenaireId, msisdn
```

#### Recharge DATA
```
POST https://api.phenix-partner.fr/GsmApi/V2/MsisdnAddDataRecharge
Body: {
  partenaireId: string,
  msisdn: string,
  volumeDataEnMo: number,
  codeZone: string
}
```

### Zones de recharge DATA (ORANGE)
- `ZoneA` : France – FairUse
- `ZoneB` : Maghreb / Turquie
- `ZoneC` : UE + DOM + Suisse + Andorre (par défaut dans l'application)
- `ZoneD` : Reste du monde
- `ZoneE` : USA / Canada
- `ZoneF` : France – Bloquée
- `ZoneG` : UE + DOM
- `ZoneH` : Suisse + Andorre
- `FRANCE_BLOQUEE` : France – Bloquée
- `FRANCE_FUP` : France – Bridage
- `HORS_EUROPE` : Hors Europe - Cut-Off

## Résolution de l'erreur 403

Si vous rencontrez une erreur 403 lors de l'appel à `GetInfoSimList`, vérifiez :

1. ✅ **Token utilisé** : L'application utilise bien l'`access_token` (Token JWT)
2. ✅ **Partenaire ID** : Votre `VITE_PHENIX_PARTENAIRE_ID` est correctement défini
3. ⚠️ **Permissions API** : Votre compte Phenix doit avoir les permissions API activées

### Actions à entreprendre si l'erreur persiste

Contactez votre représentant Phenix et demandez l'activation des permissions API pour :
- `/GsmApi/V2/GetInfoSimList` (Liste des SIMs)
- `/GsmApi/V2/MsisdnConsult` (Statut d'une ligne)
- `/GsmApi/V2/SdtrConso` (Consommation temps réel)
- `/GsmApi/V2/MsisdnAddDataRecharge` (Recharge DATA)

Vérifiez que le compte `c.noel@geoloc-systems.com` a les droits API complets.

## Support

- **Documentation API** : Fournie dans le document `PHENIX GSM API v2.8.pdf`
- **Portail Phenix** : https://partner.extranet-it.fr/login
- **Support Phenix** : Contactez votre représentant commercial
