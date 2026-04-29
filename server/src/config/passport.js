const GoogleStrategy = require("passport-google-oauth20").Strategy;
const authService = require("../services/authService");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${process.env.PORT || 3001}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          // 1. buscar usuario a través del servicio
          let user = await authService.findByEmail(email);

          // 2. si no existe → crear a través del servicio
          if (!user) {
            user = await authService.createOAuthUser({
              email,
              firstName: profile.name?.givenName || profile.displayName || "Usuario",
              lastName: profile.name?.familyName || "Google",
              photo: profile.photos?.[0]?.value || null,
            });
          }

          return done(null, user);
        } catch (err) {
          console.error("Error en estrategia de Google:", err);
          return done(err, null);
        }
      }
    )
  );
};