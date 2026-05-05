const activityService = require('../services/activityService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * ActivityController
 * 
 * Aquest controlador gestiona les peticions relacionades amb les activitats esportives.
 */
const activityController = {

  /** 
   * Retorna la llista de totes les activitats (esports) del sistema.
   */
  list: asyncHandler(async (request, response) => {
    // 1. Validacions
    const searchTerm = request.query.search || '';

    // 2. Carrega de dades
    const activitiesFound = await activityService.listActivities({ 
      search: searchTerm 
    });

    // 3. Resposta
    response.status(200).json({
      success: true,
      message: "Activitats llistades correctament",
      data: activitiesFound
    });
  }),

  /** 
   * Crea una nova activitat esportiva.
   */
  create: asyncHandler(async (request, response) => {
    // 1. Lògica de negoci
    const newActivity = await activityService.createActivity(request.body);

    // 2. Resposta
    response.status(201).json({
      success: true,
      message: "Activitat creada correctament",
      data: newActivity
    });
  }),

  /** 
   * Actualitza les dades d'una activitat existent.
   */
  update: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const activityId = Number(id);

    // 2. Lògica de negoci
    const updatedActivity = await activityService.updateActivity(
      activityId, 
      request.body
    );

    // 3. Resposta
    response.status(200).json({
      success: true,
      message: "Activitat actualitzada correctament",
      data: updatedActivity
    });
  }),

  /** 
   * Elimina una activitat de la base de dades.
   */
  delete: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const activityId = Number(id);

    // 2. Lògica d'eliminació
    await activityService.deleteActivity(activityId);

    // 3. Resposta
    response.status(200).json({
      success: true,
      message: "Activitat eliminada correctament"
    });
  }),
};

module.exports = activityController;
