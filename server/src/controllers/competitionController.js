const competitionService = require('../services/competitionService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * CompetitionController
 * 
 * Aquest controlador gestiona les peticions relacionades amb les competicions (o jornades).
 */
const competitionController = {

  /** 
   * Crea una nova jornada/competició al sistema.
   */
  create: asyncHandler(async (request, response) => {
    // 1. Validacions
    // Traiem l'ID de l'usuari que crea la competició del token de sessió
    const creatorUserId = request.user?.id || null;

    // 2. Carrega de dades i lògica de negoci
    // Cridem al servei per crear la competició amb les dades del formulari
    const newCompetition = await competitionService.createCompetition(
      request.body,
      creatorUserId
    );

    // 3. Resposta
    // Retornem l'objecte creat amb un codi 201 (creat)
    response.status(201).json({
      success: true,
      data: newCompetition
    });
  }),

  /** 
   * Retorna una llista amb totes les competicions que hi ha a la base de dades.
   */
  list: asyncHandler(async (request, response) => {
    // 1. Carrega de dades
    const competitionsList = await competitionService.listCompetitions();
    
    // 2. Resposta
    response.status(200).json({
      success: true,
      data: competitionsList
    });
  }),

  /** 
   * Obté la informació detallada d'una competició concreta pel seu ID.
   */
  getById: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const competitionId = Number(id);
    
    // 2. Carrega de dades
    const competitionFound = await competitionService.getCompetitionById(competitionId);
    
    // 3. Resposta
    response.status(200).json({
      success: true,
      data: competitionFound
    });
  }),

  /** 
   * Actualitza les dades d'una competició existent (nom, dates, etc.).
   */
  update: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const competitionId = Number(id);
    
    // 2. Lògica de negoci (actualització)
    const updatedCompetition = await competitionService.updateCompetition(
      competitionId,
      request.body
    );
    
    // 3. Resposta
    response.status(200).json({
      success: true,
      data: updatedCompetition
    });
  }),

  /** 
   * Elimina una competició de la base de dades.
   */
  delete: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const competitionId = Number(id);
    
    // 2. Lògica d'eliminació
    await competitionService.deleteCompetition(competitionId);
    
    // 3. Resposta
    response.status(200).json({ 
      success: true,
      message: 'Jornada eliminada correctament' 
    });
  })
};

module.exports = competitionController;
