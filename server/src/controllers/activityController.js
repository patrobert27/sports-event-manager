// Importem el servei que conté la lògica de negoci per a les activitats
const activityService = require('../services/activityService');

// Definim el controlador d'activitats
// Un controlador gestiona la petició HTTP (req) i la resposta (res)
const activityController = {

  // Funció per llistar totes les activitats
  // És async perquè fa operacions asíncrones (crides a base de dades, etc.)
  async list(req, res) {
    try {
      // Cridem el servei per obtenir totes les activitats
      const items = await activityService.listActivities();

      // Si tot va bé, retornem resposta 200 (OK) amb les dades en format JSON
      res.status(200).json(items);

    } catch (err) {
      // Si hi ha un error, intentem obtenir el codi d'estat de l'error
      // Si no existeix, fem servir 500 (error intern del servidor)
      const status = err && err.status ? err.status : 500;

      // Retornem una resposta amb l'error
      res.status(status).json({
        message: 'Error llistant activitats', // missatge general
        error: err.message // detall de l'error
      });
    }
  },
};

// Exportem el controlador per poder-lo utilitzar en altres parts (per exemple, rutes)
module.exports = activityController;
