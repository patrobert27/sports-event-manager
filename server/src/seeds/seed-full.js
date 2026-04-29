'use strict';

const { AppDataSource } = require('../config/data-source');

async function getOrCreate(repo, where, data) {
  let entity = await repo.findOne({ where });
  if (!entity) {
    entity = repo.create(data);
    await repo.save(entity);
  }
  return entity;
}

async function seedRoles() {
  await AppDataSource.initialize();
  console.log('🌱 Inserint rols...');

  const roleRepo = AppDataSource.getRepository('Role');
  const activityRepo = AppDataSource.getRepository('Activity');
  const fieldRepo = AppDataSource.getRepository('Field');

  await getOrCreate(roleRepo, { name: 'estudiant' }, { name: 'estudiant' });
  await getOrCreate(roleRepo, { name: 'professor' }, { name: 'professor' });
  await getOrCreate(roleRepo, { name: 'admin' }, { name: 'admin' });

  await getOrCreate(activityRepo, { name: 'futbol' }, { name: 'futbol' });
  await getOrCreate(activityRepo, { name: 'bàsquet' }, { name: 'bàsquet' });
  await getOrCreate(activityRepo, { name: 'voleibol' }, { name: 'voleibol' });

  await getOrCreate(fieldRepo, { name: 'Isaac Gálvez', location: 'Carrer de la Universitat, 1, 08001 Barcelona', number_of_courts: 2 }, { name: 'Isaac Gálvez', location: 'Carrer de la Universitat, 1, 08001 Barcelona', number_of_courts: 2 });
  await getOrCreate(fieldRepo, { name: 'Club de Futbol VNG', location: 'Carrer de la Universitat, 2, 08001 Barcelona', number_of_courts: 5 }, { name: 'Club de Futbol VNG', location: 'Carrer de la Universitat, 2, 08001 Barcelona', number_of_courts: 5 });


  console.log('✅ Rols/Activitats/Camps creats correctament');
  process.exit(0);
}

seedRoles().catch(err => {
  console.error('❌ Error al seed:', err);
  process.exit(1);
});
