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

async function dropDatabaseIfExists() {
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

    if (existsResult.rowCount === 0) {
      console.log(`Base de datos "${databaseName}" no existe.`);
      return;
    }

    // Cierra sesiones activas contra la base para permitir DROP DATABASE.
    await client.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [databaseName],
    );

    await client.query(`DROP DATABASE ${quoteIdentifier(databaseName)}`);
    console.log(`Base de datos "${databaseName}" eliminada correctamente.`);
  } finally {
    await client.end();
  }
}

dropDatabaseIfExists().catch((error) => {
  console.error('Error eliminando la base de datos:', error.message);
  process.exit(1);
});