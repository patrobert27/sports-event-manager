const { AppDataSource } = require("../config/data-source");
const User = require("../entities/User");

/**
 * AuthService
 * 
 * Aquest servei gestiona les dades dels usuaris durant el procés de login.
 * També s'encarrega de netejar les dades abans d'enviar-les al frontend.
 */
class AuthService {
  constructor() {
    this.userRepository = null;
  }

  /** 
   * Mètode per obtenir el repositori d'usuaris.
   * Fem servir "lazy initialization" per assegurar-nos que la BD està connectada.
   */
  getRepo() {
    if (!this.userRepository) {
      this.userRepository = AppDataSource.getRepository(User);
    }
    
    return this.userRepository;
  }


  /** 
   * Busca un usuari a la base de dades utilitzant el seu correu electrònic.
   * També demanem que ens porti el seu 'rol' (Admin, Estudiant, etc.).
   */
  async findByEmail(email) {
    // 1. Carrega de dades
    const userFound = await this.getRepo().findOne({ 
      where: { 
        email: email 
      }, 
      relations: { 
        role: true 
      } 
    });
    
    // 2. Resposta
    return userFound;
  }


  /** 
   * Busca un usuari pel seu ID numèric i n'inclou el rol.
   */
  async findById(id) {
    // 1. Carrega de dades
    const userFoundById = await this.getRepo().findOne({ 
      where: { 
        id: id 
      }, 
      relations: { 
        role: true 
      } 
    });
    
    // 2. Resposta
    return userFoundById;
  }

  /** 
   * Crea un nou usuari quan aquest entra per primera vegada amb el compte de Google.
   */
  async createOAuthUser({ email, firstName, lastName, photo }) {
    // 1. Lògica de negoci (creació de l'entitat)
    // El rol 1 sol ser el rol d'estudiant per defecte
    const newUser = this.getRepo().create({
      email: email.toLowerCase().trim(),
      first_name: firstName,
      last_name: lastName,
      password: "oauth_placeholder",
      photo: photo || null,
      role: { 
        id: 1 
      } 
    });

    // 2. Guardar dades
    const savedUser = await this.getRepo().save(newUser);
    
    // 3. Resposta
    return savedUser;
  }

  /** 
   * Retorna les dades de l'usuari però eliminant el camp de la contrasenya.
   * Això és molt important per a la seguretat!
   */
  sanitizeUser(user) {
    // 1. Validacions
    if (!user) {
      return null;
    }

    // 2. Lògica de neteja
    // Utilitzem destructuring per separar el password de la resta de dades
    const { password, ...userData } = user;
    
    // 3. Resposta
    return userData;
  }
}

module.exports = new AuthService();
