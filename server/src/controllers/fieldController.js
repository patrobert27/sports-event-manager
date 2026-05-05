const fieldService = require("../services/fieldService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * FieldController
 * 
 * Aquest controlador gestiona les peticions relacionades amb les instal·lacions (camps).
 */
const fieldController = {

  /**
   * Retorna una llista de totes les instal·lacions configurades.
   * Suporta cerca per nom.
   */
  list: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { search } = request.query;

    // 2. Carrega de dades
    const fieldsList = await fieldService.listFields({ 
      search: search 
    });

    // 3. Resposta
    response.json({
      success: true,
      message: "Camps llistats correctament",
      data: fieldsList
    });
  }),

  /** 
   * Crea un nou camp o instal·lació al sistema.
   */
  create: asyncHandler(async (request, response) => {
    // 1. Lògica de negoci
    const newField = await fieldService.createField(request.body);

    // 2. Resposta
    response.status(201).json({
      success: true,
      message: "Camp creat correctament",
      data: newField
    });
  }),

  /** 
   * Actualitza les dades d'una instal·lació existent.
   */
  update: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const fieldId = Number(id);
    
    // Netegem les dades per evitar canvis accidentals de l'ID
    const { id: ignoreId, ...updateData } = request.body;

    // 2. Lògica d'actualització
    const updatedField = await fieldService.updateField(
      fieldId, 
      updateData
    );

    // 3. Resposta
    response.status(200).json({
      success: true,
      message: "Camp actualitzat correctament",
      data: updatedField
    });
  }),

  /** 
   * Elimina una instal·lació de la base de dades.
   */
  delete: asyncHandler(async (request, response) => {
    // 1. Validacions
    const { id } = request.params;
    const fieldId = Number(id);

    // 2. Lògica d'eliminació
    await fieldService.deleteField(fieldId);

    // 3. Resposta
    response.status(200).json({
      success: true,
      message: "Camp eliminat correctament"
    });
  }),
};

module.exports = fieldController;
