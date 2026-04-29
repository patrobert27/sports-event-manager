const express = require("express");
const passport = require("passport");
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// Creem el router d'Express per gestionar rutes d'autenticació
const router = express.Router();

/**
 * 1. Iniciar login amb Google OAuth
 * Redirigeix l'usuari a la pantalla de login de Google
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * 2. Callback de Google OAuth
 * Google torna aquí després del login
 * Passport valida l'usuari i es crida el controller
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);

/**
 * 3. Obtenir perfil de l'usuari autenticat
 * Ruta protegida: requereix token vàlid (authMiddleware)
 */
router.get("/profile", authMiddleware, authController.getProfile);

// Exportem el router per usar-lo a l'app principal
module.exports = router;
