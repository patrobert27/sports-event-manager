// Importem el servei que conté la lògica per gestionar els camps
const fieldService = require('../services/fieldService');

// Controlador de camps (fields)
// S'encarrega de rebre la petició HTTP i retornar la resposta
const fieldController = {

  // Llista tots els camps disponibles
  async list(req, res) {
    try {
      // Demanem al servei la llista de camps
      const items = await fieldService.listFields();

      // Retornem els camps amb codi 200 (OK)
      res.status(200).json(items);

    } catch (err) {
      // Si hi ha error, definim el codi d'estat (500 per defecte)
      const status = err?.status || 500;

      // Retornem missatge d'error al client
      res.status(status).json({
        message: 'Error llistant fields',
        error: err.message
      });
    }
  },
};

module.exports = fieldController;
