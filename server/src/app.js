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

const distPath = path.join(__dirname, '../../client/jornades/dist');

/* Archivos estáticos del frontend */
app.use(express.static(distPath));


/* SPA fallback (React/Vue/etc) */
app.use((_req, res) => {
	res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;