const { AbilityBuilder, Ability } = require('@casl/ability');

/**
 * defineAbilitiesFor(user)
 * Devuelve una instancia de Ability construida a partir del usuario.
 * Implementación mínima: admin => manage all, authenticated => read/create, guest => read.
 */
function defineAbilitiesFor(user) {
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  if (!user) {
	// invitado
	can('read', 'Competition');
	return new Ability(rules);
  }

  const roleName = user?.role?.name || String(user?.role || 'user');

  if (roleName === 'admin' || roleName === 'administrator') {
	can('manage', 'all');
	return new Ability(rules);
  }

  // Usuarios autenticados por defecto pueden leer y crear competiciones
  can('read', 'Competition');
  can('create', 'Competition');

  // No permitimos update/delete por defecto salvo admin; esas reglas
  // pueden ampliarse más tarde con condiciones.

  return new Ability(rules);
}

module.exports = { defineAbilitiesFor };
