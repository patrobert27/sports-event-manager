'use strict';

const { AppDataSource } = require('../config/data-source');
const { ROLES } = require('../constants/roles');

async function getOrCreate(repo, where, data) {
  let entity = await repo.findOne({ where });
  if (!entity) {
    entity = repo.create(data);
    await repo.save(entity);
  }
  return entity;
}

async function seedRolesTest() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  console.log('🌱 Inserint rols de test...');

  const roleRepo = AppDataSource.getRepository('Role');

  await getOrCreate(roleRepo, { name: ROLES.STUDENT }, { name: ROLES.STUDENT });
  await getOrCreate(roleRepo, { name: ROLES.TEACHER }, { name: ROLES.TEACHER });
  await getOrCreate(roleRepo, { name: ROLES.ADMIN }, { name: ROLES.ADMIN });

  console.log('✅ Rols de test creats');
}

if (require.main === module) {
  seedRolesTest().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('❌ Error al seed test:', err);
    process.exit(1);
  });
}

module.exports = seedRolesTest;