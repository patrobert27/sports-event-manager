const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * AuthController
 * 
 * Aquest controlador s'encarrega de l'autenticació dels usuaris:
 * login amb Google, login de desenvolupament i obtenir el perfil actual.
 */
class AuthController {

  /**
   * Resposta després de l'autenticació amb Google.
   */
  googleCallback = asyncHandler(async (request, response) => {
    // 1. Lògica de negoci
    // Generem un token JWT que conté l'ID de l'usuari
    const sessionToken = jwt.sign(
      { 
        id: request.user.id 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: "1h" 
      }
    );
    
    // 2. Resposta
    // Redirigim l'usuari al frontend passant el token per la URL
    response.redirect(
      `http://localhost:5173/login?token=${sessionToken}`
    );
  });

  /**
   * Login per a desenvolupament (només per fer proves).
   */
  devLogin = asyncHandler(async (request, response) => {
    // 1. Validacions
    // No deixem fer servir aquest login si estem a producció per seguretat
    if (process.env.NODE_ENV === 'production') {
      const productionError = new Error('El login de desenvolupament està desactivat a producció');
      productionError.status = 403;
      throw productionError;
    }

    const { email } = request.body || {};
    
    if (!email) {
      const emailError = new Error('L\'email és necessari per al login de dev');
      emailError.status = 400;
      throw emailError;
    }

    // 2. Carrega de dades
    // Busquem l'usuari a la base de dades. Si no existeix, el creem.
    let userFound = await authService.findByEmail(email);
    
    if (!userFound) {
      // Creem un usuari de prova ràpid
      userFound = await authService.createOAuthUser({
        email: email,
        firstName: email.split('@')[0],
        lastName: 'dev',
        photo: null
      });
    }

    // 3. Lògica de negoci
    // Generem un token de sessió més llarg (8 hores) per no haver de fer login constantment en dev
    const devToken = jwt.sign(
      { 
        id: userFound.id 
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '8h' 
      }
    );
    
    // 4. Resposta
    response.json({ 
      success: true,
      token: devToken 
    });
  });

  /**
   * Retorna el perfil de l'usuari que ha iniciat sessió.
   */
  getProfile = asyncHandler(async (request, response) => {
    // 1. Carrega de dades
    // El middleware 'authMiddleware' ja ens ha carregat l'usuari a 'request.user'
    const currentUser = request.user;

    if (!currentUser) {
      const userNotFoundError = new Error("No s'ha trobat cap usuari amb aquesta sessió");
      userNotFoundError.status = 404;
      throw userNotFoundError;
    }

    // 2. Lògica (neteja)
    // Treiem les dades sensibles (password) abans d'enviar el perfil
    const cleanUserData = authService.sanitizeUser(currentUser);

    // 3. Resposta
    response.json({
      success: true,
      message: "Perfil de l'usuari obtingut correctament",
      user: cleanUserData
    });
  });
}

module.exports = new AuthController();
