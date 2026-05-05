const { AppDataSource } = require("../config/data-source");
const Field = require("../entities/Field");

/**
 * FieldService
 * 
 * Aquesta classe conté la lògica per gestionar les instal·lacions (camps).
 */
class FieldService {
  constructor() {
    this.fieldRepository = null;
  }

  // Mètode per obtenir el repositori d'instal·lacions
  getRepo() {
    if (!this.fieldRepository) {
      this.fieldRepository = AppDataSource.getRepository(Field);
    }
    
    return this.fieldRepository;
  }

  /**
   * Retorna totes les instal·lacions que tenim a la base de dades.
   */
  async listFields({ search } = {}) {
    // 1. Carrega de dades (QueryBuilder)
    const queryBuilder = this.getRepo().createQueryBuilder("field");

    // 2. Lògica de negoci (filtre de cerca)
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      
      queryBuilder.where(
        "LOWER(field.name) LIKE :term", 
        { 
          term: searchTerm 
        }
      );
    }

    // Ordenem alfabèticament pel nom
    queryBuilder.orderBy("field.name", "ASC");

    // 3. Resposta
    const fieldsFound = await queryBuilder.getMany();
    
    return fieldsFound;
  }

  /** 
   * Crea una nova instal·lació al sistema.
   */
  async createField(fieldData) {
    // 1. Validacions
    const repository = this.getRepo();

    if (fieldData.name) {
      // Comprovem si el nom ja existeix
      const existingField = await repository.findOne({ 
        where: { 
          name: fieldData.name 
        } 
      });
      
      if (existingField) {
        throw new Error("Ja existeix un camp amb aquest nom");
      }
    }

    // 2. Lògica de creació
    const newFieldEntity = repository.create(fieldData);
    
    // 3. Guardar dades
    const savedField = await repository.save(newFieldEntity);
    
    // 4. Resposta
    return savedField;
  }

  /** 
   * Actualitza les dades d'una instal·lació.
   */
  async updateField(fieldId, updateData) {
    // 1. Validacions i Carrega
    const repository = this.getRepo();
    
    const fieldToUpdate = await repository.findOne({ 
      where: { 
        id: fieldId 
      } 
    });
    
    if (!fieldToUpdate) {
      throw new Error("Camp no trobat");
    }

    // Si canviem el nom, mirem que el nou no estigui ja agafat
    const hasNameChanged = updateData.name && updateData.name !== fieldToUpdate.name;

    if (hasNameChanged) {
      const nameAlreadyUsed = await repository.findOne({ 
        where: { 
          name: updateData.name 
        } 
      });
      
      if (nameAlreadyUsed) {
        throw new Error("Aquest nom de camp ja està en ús");
      }
    }

    // 2. Lògica d'actualització
    repository.merge(fieldToUpdate, updateData);
    
    // 3. Guardar dades
    const updatedFieldInfo = await repository.save(fieldToUpdate);
    
    // 4. Resposta
    return updatedFieldInfo;
  }

  /** 
   * Elimina una instal·lació.
   */
  async deleteField(fieldId) {
    // 1. Validacions i Carrega
    const repository = this.getRepo();
    
    const fieldToDelete = await repository.findOne({ 
      where: { 
        id: fieldId 
      } 
    });
    
    if (!fieldToDelete) {
      throw new Error("Camp no trobat");
    }

    // 2. Lògica d'eliminació
    const deletionResult = await repository.remove(fieldToDelete);
    
    // 3. Resposta
    return deletionResult;
  }
}

module.exports = new FieldService();
