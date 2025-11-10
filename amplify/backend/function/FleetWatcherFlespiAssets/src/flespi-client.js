/**
 * Client API Flespi pour la gestion des Assets
 * Documentation: https://flespi.com/kb/assets-and-containers
 */

const https = require('https');

class FlespiClient {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://flespi.io';
  }

  /**
   * Effectue une requête HTTP vers l'API Flespi
   * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
   * @param {string} path - Chemin de l'API (ex: /gw/assets)
   * @param {object} body - Corps de la requête (optionnel)
   * @returns {Promise<object>} - Réponse de l'API
   */
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

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject({
                statusCode: res.statusCode,
                message: response.errors || response.message || 'Erreur API Flespi',
                response: response
              });
            }
          } catch (error) {
            reject({
              statusCode: res.statusCode,
              message: 'Erreur de parsing JSON',
              error: error.message
            });
          }
        });
      });

      req.on('error', (error) => {
        reject({
          message: 'Erreur de connexion à Flespi',
          error: error.message
        });
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  /**
   * Crée un asset Flespi
   * @param {object} assetData - Données de l'asset (name, type, meta)
   * @returns {Promise<object>} - Asset créé
   */
  async createAsset(assetData) {
    const payload = {
      name: assetData.name,
      meta: assetData.meta || {}
    };

    return await this.request('POST', '/gw/assets', payload);
  }

  /**
   * Met à jour un asset Flespi
   * @param {number} assetId - ID de l'asset
   * @param {object} assetData - Données à mettre à jour
   * @returns {Promise<object>} - Asset mis à jour
   */
  async updateAsset(assetId, assetData) {
    const payload = {
      name: assetData.name,
      meta: assetData.meta || {}
    };

    return await this.request('PUT', `/gw/assets/${assetId}`, payload);
  }

  /**
   * Supprime un asset Flespi
   * @param {number} assetId - ID de l'asset
   * @returns {Promise<object>} - Confirmation de suppression
   */
  async deleteAsset(assetId) {
    return await this.request('DELETE', `/gw/assets/${assetId}`);
  }

  /**
   * Récupère un asset Flespi
   * @param {number} assetId - ID de l'asset
   * @returns {Promise<object>} - Asset récupéré
   */
  async getAsset(assetId) {
    const response = await this.request('GET', `/gw/assets/${assetId}`);
    return response.result && response.result[0] ? response.result[0] : null;
  }

  /**
   * Crée un intervalle d'association entre un device et un asset
   * @param {number} assetId - ID de l'asset
   * @param {object} intervalData - Données de l'intervalle
   * @returns {Promise<object>} - Intervalle créé
   */
  async createInterval(assetId, intervalData) {
    const payload = {
      begin: intervalData.begin || Math.floor(Date.now() / 1000),
      end: intervalData.end || 0, // 0 = intervalle ouvert (pas de fin)
      device_id: intervalData.device_id,
      meta: intervalData.meta || {}
    };

    return await this.request('POST', `/gw/assets/${assetId}/intervals`, payload);
  }

  /**
   * Met à jour un intervalle (notamment pour le fermer)
   * @param {number} assetId - ID de l'asset
   * @param {number} intervalId - ID de l'intervalle
   * @param {object} intervalData - Données à mettre à jour
   * @returns {Promise<object>} - Intervalle mis à jour
   */
  async updateInterval(assetId, intervalId, intervalData) {
    return await this.request('PUT', `/gw/assets/${assetId}/intervals/${intervalId}`, intervalData);
  }

  /**
   * Ferme un intervalle en définissant sa date de fin
   * @param {number} assetId - ID de l'asset
   * @param {number} intervalId - ID de l'intervalle
   * @param {number} endTimestamp - Timestamp de fin (optionnel, défaut: maintenant)
   * @returns {Promise<object>} - Intervalle fermé
   */
  async closeInterval(assetId, intervalId, endTimestamp = null) {
    const payload = {
      end: endTimestamp || Math.floor(Date.now() / 1000)
    };

    return await this.updateInterval(assetId, intervalId, payload);
  }

  /**
   * Récupère tous les intervalles d'un asset
   * @param {number} assetId - ID de l'asset
   * @returns {Promise<Array>} - Liste des intervalles
   */
  async getIntervals(assetId) {
    const response = await this.request('GET', `/gw/assets/${assetId}/intervals`);
    return response.result || [];
  }

  /**
   * Récupère l'intervalle actif (ouvert) d'un asset
   * @param {number} assetId - ID de l'asset
   * @returns {Promise<object|null>} - Intervalle actif ou null
   */
  async getActiveInterval(assetId) {
    const intervals = await this.getIntervals(assetId);
    return intervals.find(interval => interval.end === 0) || null;
  }
}

module.exports = FlespiClient;
