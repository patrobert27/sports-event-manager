const { defineAbilitiesFor } = require("../config/abilities");

/**
 * Middleware de permisos (RBAC/ABAC)
 * Controla si l'usuari pot fer una acció sobre un recurs
 */
function checkAbility(action, subject) {
	return async function (req, res, next) {

		// Si no hi ha usuari autenticat, no es permet l'accés
		if (!req.user) {
			return res.status(401).send('Token invàlid o usuari no autenticat');
		}

		// Generem les regles de permisos per aquest usuari
		const ability = defineAbilitiesFor(req.user);

		try {

			// CAS 1: el subject és un string (tipus de recurs)
			if (typeof subject === 'string') {
				const hasAbility = ability.can(action, subject);
				// console.log(`[checkAbility] Avaluant: ${action} sobre ${subject} -> Resultat: ${hasAbility}`);
				if (hasAbility) {
					return next();
				}
				return res.status(403).send('Accés denegat');
			}

			// CAS 2: el subject és una funció que resol una instància
			if (typeof subject === 'function') {
				const resolved = subject(req);

				// Permet suport per funcions async o sync
				const instance =
					resolved && typeof resolved.then === 'function'
						? await resolved
						: resolved;

				if (ability.can(action, instance)) {
					return next();
				}

				return res.status(403).send('Accés denegat');
			}

			// CAS 3: fallback directe
			if (ability.can(action, subject)) {
				return next();
			}

			return res.status(403).send('Accés denegat');

		} catch (err) {
			// Error intern en el sistema de permisos
			console.error('[checkAbility] Error avaluant permisos:', err);
			return res.status(500).send('Error intern avaluant permisos');
		}
	};
}

module.exports = checkAbility;
