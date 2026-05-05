const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const { STUDENT_VARIANTS, TEACHER_VARIANTS, ADMIN_VARIANTS } = require('../constants/roles');

/**
 * defineAbilitiesFor(user)
 * Construeix les regles de permisos basades en el rol de l'usuari.
 */
function defineAbilitiesFor(user) {
  // console.log('[Abilities] Definint permisos per a lusuari:', { id: user?.id, email: user?.email, role: user?.role });
  
  const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);

  // 1. Convidats
  if (!user) {
    can('read', 'Competition');
    can('read', 'Team');
    return createMongoAbility(rules);
  }

  // 2. Permisos base per a tothom
  can('read', 'Competition');
  can('read', 'Activity');
  can('read', 'Field');
  can('read', 'Team');
  can('read', 'TeamPlayer');

  const roleName = (user?.role?.name || "").toString().toLowerCase();

  // 3. Admin
  if (ADMIN_VARIANTS.includes(roleName)) {
    can('manage', 'all');
    cannot('create', 'Team');
  }

  // 4. Estudiants: Crear equips i participar
  if (STUDENT_VARIANTS.includes(roleName)) {
    can('create', 'Team');
    can('create', 'TeamPlayer');
    can('update', 'Team');
    can('delete', 'Team');
    can('manage', 'TeamPlayer');
  }

  // 5. Professors
  if (TEACHER_VARIANTS.includes(roleName)) {
    can('update', 'Team');
    can('manage', 'TeamPlayer');
  }

  return createMongoAbility(rules);
}

module.exports = { defineAbilitiesFor };
