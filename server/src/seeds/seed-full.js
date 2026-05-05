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

async function seedRoles() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  console.log('🌱 Inserint rols i dades base...');

  const roleRepo = AppDataSource.getRepository('Role');
  const activityRepo = AppDataSource.getRepository('Activity');
  const fieldRepo = AppDataSource.getRepository('Field');

  // Ús de constants centralitzades
  await getOrCreate(roleRepo, { name: ROLES.STUDENT }, { name: ROLES.STUDENT });
  await getOrCreate(roleRepo, { name: ROLES.TEACHER }, { name: ROLES.TEACHER });
  await getOrCreate(roleRepo, { name: ROLES.ADMIN }, { name: ROLES.ADMIN });

  await getOrCreate(activityRepo, { name: 'futbol' }, { name: 'futbol', color: '#10b981', min_players: 1, max_players: 11 });
  await getOrCreate(activityRepo, { name: 'bàsquet' }, { name: 'bàsquet', color: '#f59e0b', min_players: 1, max_players: 5 });
  await getOrCreate(activityRepo, { name: 'voleibol' }, { name: 'voleibol', color: '#ef4444', min_players: 1, max_players: 6 });

  await getOrCreate(fieldRepo, { name: 'Isaac Gálvez' }, { name: 'Isaac Gálvez', location: 'Carrer de la Universitat, 1, 08001 Barcelona', number_of_courts: 2 });
  await getOrCreate(fieldRepo, { name: 'Club de Futbol VNG' }, { name: 'Club de Futbol VNG', location: 'Carrer de la Universitat, 2, 08001 Barcelona', number_of_courts: 5 });


  console.log('✅ Rols/Activitats/Camps creats correctament');
}

if (require.main === module) {
  seedRoles().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('❌ Error al seed:', err);
    process.exit(1);
  });
}

module.exports = seedRoles;
