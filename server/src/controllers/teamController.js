const teamService = require('../services/teamService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * TeamController
 * 
 * Aquest controlador gestiona totes les peticions HTTP que tenen a veure amb els equips.
 * S'encarrega de rebre la informació del navegador, cridar al servei corresponent
 * i finalment retornar la resposta a l'usuari.
 */
const teamController = {
  
  /**
   * Crea un nou equip a la base de dades.
   */
  create: asyncHandler(async (request, response) => {
    // 1. Validacions
    // L'ID de l'usuari que crea l'equip el traiem del token d'autenticació
    const creatorUserId = request.user.id;
    
    // 2. Carrega de dades i lògica de negoci
    // Cridem al servei per crear l'equip amb les dades que ens arriben al cos (body) de la petició
    const newTeam = await teamService.createTeam(
      request.body, 
      creatorUserId
    );
    
    // 3. Resposta
    // Si tot ha anat bé, retornem l'equip creat amb un codi 201 (creat)
    response.status(201).json({ 
      success: true, 
      data: newTeam 
    });
  }),

  /**
   * Llista tots els equips. Es pot filtrar per una competició específica.
   */
  list: asyncHandler(async (request, response) => {
    // 1. Validacions
    // Mirem si ens han passat un ID de competició per la URL (query string)
    const { competition_id } = request.query;
    
    // 2. Carrega de dades
    // Si tenim ID de competició el convertim a número, si no, passem null
    const teamsList = await teamService.listTeams(
      competition_id 
        ? Number(competition_id) 
        : null
    );
    
    // 3. Resposta
    response.status(200).json({ 
      success: true, 
      data: teamsList 
    });
  }),

  /**
   * Obté la informació detallada d'un equip concret pel seu ID.
   */
  getById: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const teamId = Number(id);
    
    // 2. Carrega de dades
    const teamFound = await teamService.getTeamById(teamId);
    
    // 3. Resposta
    response.status(200).json({ 
      success: true, 
      data: teamFound 
    });
  }),

  /**
   * Actualitza les dades d'un equip (nom, colors, tutor, etc.).
   */
  update: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const teamId = Number(id);
    const userId = request.user.id;
    
    // 2. Lògica de negoci
    // Passem l'ID de l'usuari actual per comprovar si té permís d'edició segons la fase de la competició
    const updatedTeam = await teamService.updateTeam(
      teamId, 
      request.body, 
      userId
    );
    
    // 3. Resposta
    response.status(200).json({ 
      success: true, 
      data: updatedTeam 
    });
  }),

  /**
   * Elimina un equip de la base de dades.
   */
  delete: asyncHandler(async (request, response) => {
    // 1. Validacions i Càrrega
    const { id } = request.params;
    const teamId = Number(id);
    
    const teamToDelete = await teamService.getTeamById(teamId);

    // Comprovem si l'usuari actual té permisos per gestionar (eliminar) aquest equip
    const hasPermission = teamService.canManageTeam(
      request.user, 
      teamToDelete
    );

    if (!hasPermission) {
      return response.status(403).json({ 
        success: false,
        message: 'No tens permís per eliminar aquest equip' 
      });
    }

    // 2. Lògica d'eliminació
    const deletionResult = await teamService.deleteTeam(teamId);
    
    // 3. Resposta
    response.status(200).json({ 
      success: true, 
      ...deletionResult 
    });
  }),

  /**
   * Permet a un estudiant sol·licitar unir-se a un equip.
   */
  join: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const teamId = Number(id);
    const userId = request.user.id;
    
    // 2. Lògica de negoci
    const playerRequest = await teamService.joinTeam(
      teamId, 
      userId
    );
    
    // 3. Resposta
    response.status(201).json({ 
      success: true, 
      message: 'Sol·licitud enviada correctament', 
      data: playerRequest 
    });
  }),

  /**
   * Accepta una sol·licitud d'un jugador per entrar a l'equip.
   */
  acceptMember: asyncHandler(async (request, response) => {
    // 1. Validacions i Càrrega
    const { playerRecordId } = request.params;
    const recordId = Number(playerRecordId);
    
    const teamRelated = await teamService.getTeamByPlayerRecordId(recordId);
    
    // Verifiquem si qui accepta el membre té permisos (Capità, Tutor o Admin)
    const canManage = teamService.canManageTeam(
      request.user, 
      teamRelated
    );

    if (!canManage) {
      return response.status(403).json({ 
        success: false,
        message: 'No tens permís per gestionar els membres d’aquest equip' 
      });
    }

    // 2. Lògica de negoci
    const updatedPlayerRecord = await teamService.acceptMember(recordId);
    
    // 3. Resposta
    response.json({ 
      success: true, 
      message: 'Membre acceptat correctament', 
      data: updatedPlayerRecord 
    });
  }),

  /**
   * Elimina un membre de l'equip (ja sigui per expulsió o perquè marxa voluntàriament).
   */
  removeMember: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { playerRecordId } = request.params;
    const recordId = Number(playerRecordId);
    const currentUserId = request.user.id;
    
    // 2. Lògica de negoci
    // El servei s'encarrega de mirar si l'usuari és el propi jugador, el capità o un admin
    const removalResult = await teamService.removeMember(
      recordId, 
      currentUserId
    );
    
    // 3. Resposta
    response.json({ 
      success: true, 
      ...removalResult 
    });
  }),

  /**
   * Traspassa la capitania de l'equip a un altre membre.
   */
  transferCaptaincy: asyncHandler(async (request, response) => {
    // 1. Validacions i Càrrega
    const { id } = request.params;
    const teamId = Number(id);
    const { newCaptainId } = request.body;
    
    const currentTeam = await teamService.getTeamById(teamId);

    // Només el Capità actual, el Tutor o l'Admin poden fer el canvi
    const canChangeCaptain = teamService.canManageTeam(
      request.user, 
      currentTeam
    );

    if (!canChangeCaptain) {
      return response.status(403).json({ 
        success: false,
        message: 'No tens permís per traspassar la capitania' 
      });
    }

    // 2. Lògica de negoci
    const updatedTeamInfo = await teamService.transferCaptaincy(
      teamId, 
      Number(newCaptainId)
    );
    
    // 3. Resposta
    response.json({ 
      success: true, 
      message: 'Capitania transferida correctament', 
      data: updatedTeamInfo 
    });
  }),

  /**
   * Comprova si l'equip té el mínim i màxim de jugadors necessaris per competir.
   */
  readiness: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const teamId = Number(id);
    
    // 2. Carrega de dades i càlculs
    const readinessInfo = await teamService.validateTeamReadiness(teamId);
    
    // 3. Resposta
    response.json({ 
      success: true, 
      data: readinessInfo 
    });
  }),
};

module.exports = teamController;
