require('reflect-metadata');
require("dotenv").config();

const express = require('express');
const passport = require("passport");
const cors = require('cors');
const path = require('path');

const authRoutes = require("./routes/auth");
const competitionRoutes = require("./routes/competition");
const activitiesRoutes = require("./routes/activities");
const fieldsRoutes = require("./routes/fields");
const usersRoutes = require("./routes/users");
const teamsRoutes = require("./routes/teams");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

/* Inicializa Passport (login Google) */
app.use(passport.initialize());
require("./config/passport")(passport);


/* Rutas de autenticación */
app.use("/auth", authRoutes);

/* Rutas de jornades/competicions */
app.use("/jornades/competicions", competitionRoutes);

/* Rutas públicas para datos auxiliares */
app.use("/activities", activitiesRoutes);
app.use("/fields", fieldsRoutes);

/* Rutas de equipos */
app.use("/teams", teamsRoutes);

/* Rutas de usuarios */
app.use("/users", usersRoutes);

const distPath = path.join(__dirname, '../../client/jornades/dist');

/* Archivos estáticos del frontend */
app.use(express.static(distPath));


/* SPA fallback (React/Vue/etc) */
app.use((_req, res) => {
	res.sendFile(path.join(distPath, 'index.html'));
});

/* Middleware d'Errors Global (ha d'anar al final de tot) */
app.use(errorHandler);

module.exports = app;