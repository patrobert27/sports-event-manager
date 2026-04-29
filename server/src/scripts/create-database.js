require('dotenv').config();
const { Client } = require('pg');

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT || 5432);
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || '';
const databaseName = process.env.DB_NAME || 'jornades_db';
const adminDatabase = process.env.DB_ADMIN_DB || 'postgres';

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function createDatabaseIfNeeded() {
  const client = new Client({
    host,
    port,
    user,
    password,
    database: adminDatabase,
  });

  await client.connect();

  try {
    const existsResult = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);

    if (existsResult.rowCount > 0) {
      console.log(`Base de datos \"${databaseName}\" ya existe.`);
      return;
    }

    await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
    console.log(`Base de datos \"${databaseName}\" creada correctamente.`);
  } finally {
    await client.end();
  }
}

createDatabaseIfNeeded().catch((error) => {
  console.error('Error creando la base de datos:', error.message);
  // Si arribes aquí, alguna cosa ha anat malament
  // console.error(error);
  process.exit(1);
});

// Si arribes aquí, tot ha anat bé
console.log('Procés de creació de la base de dades completat correctament.');