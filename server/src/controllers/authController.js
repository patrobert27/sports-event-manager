// Importem la llibreria per treballar amb JSON Web Tokens (JWT)
const jwt = require("jsonwebtoken");

// Importem el servei d'autenticació (lògica de negoci relacionada amb usuaris)
const authService = require("../services/authService");

// Definim una classe controlador per gestionar autenticació
class AuthController {

  /**
   * Callback de Google OAuth
   * Aquesta funció s'executa després que l'usuari faci login amb Google
   * El backend rep l'usuari autenticat (req.user) i genera un token JWT
   * Finalment redirigeix cap al frontend amb el token
   */
  googleCallback(req, res) {

    // Creem un token JWT amb l'ID de l'usuari
    const token = jwt.sign(
      { userId: req.user.id }, // dades que guardem dins del token
      process.env.JWT_SECRET,  // clau secreta per signar el token
      { expiresIn: "1h" }      // temps d'expiració del token
    );

    // Redirigim al frontend passant el token com a paràmetre a la URL
    res.redirect(`http://localhost:5173/login?token=${token}`);
  }

  /**
   * Retorna les dades de l'usuari autenticat
   * Aquesta és una ruta protegida (requereix login previ)
   */
  async getProfile(req, res) {
    try {
      // Busquem l'usuari a la base de dades utilitzant l'ID del token
      const user = await authService.findById(req.user.userId);

      // Si no existeix l'usuari, retornem error 404
      if (!user) {
        return res.status(404).json({ message: "Usuari no trobat" });
      }

      // Netegem les dades de l'usuari (per exemple, eliminant password)
      const userData = authService.sanitizeUser(user);

      // Retornem les dades de l'usuari
      res.json({
        message: "Ruta protegida",
        user: userData
      });

    } catch (err) {
      // Si hi ha un error inesperat, el mostrem per consola
      console.error("Error obtenint perfil:", err);

      // Retornem error 500 (error intern del servidor)
      res.status(500).json({ message: "Error del servidor" });
    }
  }
}

// Exportem una instància del controlador (singleton)
module.exports = new AuthController();
