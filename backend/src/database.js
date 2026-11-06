import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});

pool.on('error', (error) => {
    console.error('Unerwarteter Fehler im Datenbank-Pool:', error.message);
});

async function checkDatabaseConnection() {
    const result = await pool.query('SELECT current_user AS "currentUser"');
    console.log(`Datenbankverbindung steht, Benutzer: ${result.rows[0].currentUser}`);
}

export { pool, checkDatabaseConnection };