const competitionService = require('../services/competitionService');
const authService = require('../services/authService');

const competitionController = {

  /** Crea una nova jornada/competició */
  async create(req, res) {
    try {
      // ID de l'usuari creador (si està autenticat)
      const creatorId = req.user?.id || null;

      // Creem la competició amb les dades del body i l'usuari creador
      const competition = await competitionService.createCompetition(
        req.body,
        creatorId
      );

      // Eliminem dades sensibles del creador abans de retornar resposta
      if (competition?.creator) {
        competition.creator = authService.sanitizeUser(competition.creator);
      }

      res.status(201).json(competition);
    } catch (err) {
      const status = err?.status || 400;

      res.status(status).json({
        message: 'Error creant la jornada',
        error: err.message
      });
    }
  },

  /** Retorna totes les competicions */
  async list(req, res) {
    try {
      const competitions = await competitionService.listCompetitions();

      // Netegem dades sensibles de cada creador
      const safe = competitions.map(c => {
        if (c?.creator) {
          c.creator = authService.sanitizeUser(c.creator);
        }
        return c;
      });

      res.status(200).json(safe);
    } catch (err) {
      const status = err?.status || 500;

      res.status(status).json({
        message: 'Error llistant les jornades',
        error: err.message
      });
    }
  },

  /** Obté una competició concreta per ID */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const competition = await competitionService.getCompetitionById(Number(id));

      // Netegem el creador si existeix
      if (competition?.creator) {
        competition.creator = authService.sanitizeUser(competition.creator);
      }

      res.status(200).json(competition);
    } catch (err) {
      const status = err?.status || 500;

      res.status(status).json({
        message: 'Error obtenint la jornada',
        error: err.message
      });
    }
  },

  /** Actualitza una competició existent */
  async update(req, res) {
    try {
      const { id } = req.params;

      const updated = await competitionService.updateCompetition(
        Number(id),
        req.body
      );

      // Netegem dades del creador després d'actualitzar
      if (updated?.creator) {
        updated.creator = authService.sanitizeUser(updated.creator);
      }

      res.status(200).json(updated);
    } catch (err) {
      const status = err?.status || 400;

      res.status(status).json({
        message: 'Error actualitzant la jornada',
        error: err.message
      });
    }
  },

  /** Elimina una competició */
  async delete(req, res) {
    try {
      const { id } = req.params;

      await competitionService.deleteCompetition(Number(id));

      res.status(200).json({ message: 'Jornada eliminada' });
    } catch (err) {
      const status = err?.status || 500;

      res.status(status).json({
        message: 'Error eliminant la jornada',
        error: err.message
      });
    }
  },
};

module.exports = competitionController;
