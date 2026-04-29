const { AppDataSource } = require("../config/data-source");
const User = require("../entities/User");

class AuthService {
  constructor() {
    this.userRepo = null;
  }

  /** Lazy init del repositorio (la DB puede no estar lista en el import) */
  getRepo() {
    if (!this.userRepo) {
      this.userRepo = AppDataSource.getRepository(User);
    }
    return this.userRepo;
  }


  /** Busca un usuario por email e incluye el rol */
  async findByEmail(email) {
    return this.getRepo().findOne({ where: { email }, relations: { role: true } });
  }


  /** Busca un usuario por ID e incluye el rol */
  async findById(id) {
    return this.getRepo().findOne({ where: { id }, relations: { role: true } });
  }

  /** Crea un usuario nuevo (para el flujo OAuth) */
  async createOAuthUser({ email, firstName, lastName, photo }) {
    const user = this.getRepo().create({
      email,
      first_name: firstName,
      last_name: lastName,
      password: "oauth_placeholder",
      photo: photo || null,
      role: 1, // de default es alumne
    });

    return this.getRepo().save(user);
  }

  /** Devuelve los datos del usuario sin el password */
  sanitizeUser(user) {
    const { password, ...userData } = user;
    return userData;
  }
}

module.exports = new AuthService();
