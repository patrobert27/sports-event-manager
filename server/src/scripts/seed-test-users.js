const { AppDataSource } = require('../config/data-source');

async function run() {
  await AppDataSource.initialize();
  const roleRepo = AppDataSource.getRepository('Role');
  const userRepo = AppDataSource.getRepository('User');
  const activityRepo = AppDataSource.getRepository('Activity');
  const fieldRepo = AppDataSource.getRepository('Field');

  const roles = {};
  for (const name of ['admin', 'professor', 'estudiant']) {
    let r = await roleRepo.findOne({ where: { name } });
    if (!r) {
      r = roleRepo.create({ name });
      await roleRepo.save(r);
    }
    roles[name] = r;
  }

  // create users
  const usersData = [
    { first_name: 'Admin', last_name: 'User', email: 'admin@example.com', password: 'pass', role: roles['admin'] },
    { first_name: 'Prof', last_name: 'User', email: 'prof@example.com', password: 'pass', role: roles['professor'] },
    { first_name: 'Student', last_name: 'User', email: 'student@example.com', password: 'pass', role: roles['estudiant'] },
  ];

  const created = [];
  for (const u of usersData) {
    let existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      const user = userRepo.create({
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        password: u.password,
        role: { id: u.role.id },
      });
      existing = await userRepo.save(user);
    }
    created.push(existing);
  }

  // ensure there's at least one activity
  let activity = await activityRepo.findOne({ where: { name: 'futbol' } });
  if (!activity) {
    activity = activityRepo.create({ name: 'futbol' });
    await activityRepo.save(activity);
  }

  // ensure there's at least one field
  let field = await fieldRepo.findOne({ where: { name: 'Pista 1' } });
  if (!field) {
    field = fieldRepo.create({ name: 'Pista 1', location: 'Campus' });
    await fieldRepo.save(field);
  }

  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

  console.log('--- CREATED USERS ---');
  for (const u of created) {
    const token = jwt.sign({ id: u.id }, secret, { expiresIn: '1h' });
    console.log(`${u.email} -> id=${u.id} token=${token}`);
  }

  console.log('activity id:', activity.id);
  console.log('field id:', field.id);

  process.exit(0);
}

run().catch(err => {
  console.error('Error seeding test users', err);
  process.exit(1);
});
