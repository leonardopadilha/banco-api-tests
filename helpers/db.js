require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const db = pool.promise();

async function getUltimaTransferenciaId() {
    const [[row]] = await db.query('SELECT MAX(id) AS id FROM transferencias');
    return row.id;
}

module.exports = { getUltimaTransferenciaId };
