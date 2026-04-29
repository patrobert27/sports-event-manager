require('dotenv').config();
const app = require('./app');
const { AppDataSource } = require('./config/data-source');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✓ PostgreSQL conectado correctamente');

    app.listen(PORT, () => {
      console.log(`✓ Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Error iniciando servidor:', error.message);
    process.exit(1);
  }
};

startServer();
