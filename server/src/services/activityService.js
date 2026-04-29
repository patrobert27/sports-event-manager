const { AppDataSource } = require('../config/data-source');
const Activity = require('../entities/Activity');

/**
 * Servei d'activitats
 * Conté la lògica d'accés a dades (base de dades)
 */
class ActivityService {
  constructor() {
    // Repository inicialment buit (lazy loading)
    this.repo = null;
  }

  /**
   * Retorna el repository de TypeORM
   * El crea només la primera vegada (optimització)
   */
  getRepo() {
    if (!this.repo) {
      this.repo = AppDataSource.getRepository(Activity);
    }
    return this.repo;
  }

  /**
   * Retorna totes les activitats de la base de dades
   */
  async listActivities() {
    const repo = this.getRepo();

    // Consulta a la BD
    const items = await repo.find();

    return items;
  }
}

// Exportem una sola instància del servei (singleton)
module.exports = new ActivityService();
