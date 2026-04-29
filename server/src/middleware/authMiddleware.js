const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/data-source");
const User = require("../entities/User");

/**
 * Middleware d'autenticació
 * Comprova si l'usuari envia un token vàlid i el carrega a req.user
 */
async function authMiddleware(req, res, next) {
  // Llegim la capçalera Authorization
  const authHeader = req.headers.authorization;

  // Si no hi ha token, rebutgem la petició
  if (!authHeader) {
    return res.status(401).send("No token");
  }

  // El token pot venir com "Bearer xxx" o directament
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    // Verifiquem el token amb la clau secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busquem l'usuari a la base de dades
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: decoded.id },
      relations: { role: true }, // carreguem també el rol
    });

    // Si no existeix l'usuari, no és vàlid
    if (!user) {
      return res.status(401).send("Usuari no trobat");
    }

    // Afegim l'usuari a la request perquè estigui disponible després
    req.user = user;

    // Continuem amb la següent funció
    next();

  } catch (err) {
    // Si el token és invàlid o ha caducat
    res.status(401).send("Token invàlid");
  }
}

module.exports = authMiddleware;
