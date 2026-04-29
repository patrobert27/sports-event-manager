const { AppDataSource } = require('../config/data-source');
const Field = require('../entities/Field');

class FieldService {
  constructor() {
    this.repo = null;
  }

  getRepo() {
    if (!this.repo) this.repo = AppDataSource.getRepository(Field);
    return this.repo;
  }

  async listFields() {
    const repo = this.getRepo();
    const items = await repo.find();
    return items;
  }
}

module.exports = new FieldService();
