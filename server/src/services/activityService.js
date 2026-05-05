const { AppDataSource } = require("../config/data-source");
const Activity = require("../entities/Activity");

/**
 * ActivityService
 * 
 * Aquesta classe conté la lògica per gestionar els diferents esports (activitats)
 * que es poden fer a les jornades.
 */
class ActivityService {
  constructor() {
    this.activityRepository = null;
  }

  // Mètode per obtenir el repositori d'activitats
  getRepo() {
    if (!this.activityRepository) {
      this.activityRepository = AppDataSource.getRepository(Activity);
    }
    
    return this.activityRepository;
  }

  /**
   * Retorna una llista de totes les activitats (esports) guardades.
   * Permet filtrar pel nom de l'activitat.
   */
  async listActivities({ search } = {}) {
    // 1. Carrega de dades (QueryBuilder)
    const queryBuilder = this.getRepo().createQueryBuilder("activity");

    // 2. Lògica de negoci (filtre)
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      
      queryBuilder.where(
        "LOWER(activity.name) LIKE :term", 
        { 
          term: searchTerm 
        }
      );
    }

    // Ordenem les activitats pel seu nom en ordre alfabètic
    queryBuilder.orderBy("activity.name", "ASC");

    // 3. Resposta
    const activitiesList = await queryBuilder.getMany();
    
    return activitiesList;
  }

  /** 
   * Crea una nova activitat esportiva a la base de dades.
   */
  async createActivity(activityData) {
    // 1. Validacions
    const repository = this.getRepo();
    
    if (activityData.name) {
      // Comprovem si ja existeix una activitat amb el mateix nom
      const existingActivity = await repository.findOne({ 
        where: { 
          name: activityData.name 
        } 
      });
      
      if (existingActivity) {
        throw new Error("Ja existeix una activitat amb aquest nom");
      }
    }

    // 2. Lògica de creació
    const newActivityEntity = repository.create(activityData);
    
    // 3. Guardar dades
    const savedActivity = await repository.save(newActivityEntity);
    
    // 4. Resposta
    return savedActivity;
  }

  /** 
   * Actualitza la informació d'una activitat que ja existeix.
   */
  async updateActivity(activityId, updateData) {
    // 1. Validacions i Carrega
    const repository = this.getRepo();
    
    const activityToUpdate = await repository.findOne({ 
      where: { 
        id: activityId 
      } 
    });
    
    if (!activityToUpdate) {
      throw new Error("Activitat no trobada");
    }

    // Si estem canviant el nom, mirem que el nom nou no estigui ja agafat
    const hasNameChanged = updateData.name && updateData.name !== activityToUpdate.name;

    if (hasNameChanged) {
      const nameInUse = await repository.findOne({ 
        where: { 
          name: updateData.name 
        } 
      });
      
      if (nameInUse) {
        throw new Error("Aquest nom d'activitat ja està en ús per una altra");
      }
    }

    // 2. Lògica d'actualització
    // Ajuntem les dades noves amb les de l'entitat existent
    repository.merge(activityToUpdate, updateData);
    
    // 3. Guardar dades
    const updatedActivity = await repository.save(activityToUpdate);
    
    // 4. Resposta
    return updatedActivity;
  }

  /** 
   * Elimina una activitat de la base de dades.
   */
  async deleteActivity(activityId) {
    // 1. Validacions i Carrega
    const repository = this.getRepo();
    
    const activityToDelete = await repository.findOne({ 
      where: { 
        id: activityId 
      } 
    });
    
    if (!activityToDelete) {
      throw new Error("Activitat no trobada");
    }

    // 2. Lògica d'eliminació
    const deletionResult = await repository.remove(activityToDelete);
    
    // 3. Resposta
    return deletionResult;
  }
}

module.exports = new ActivityService();
