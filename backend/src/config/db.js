const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Intentar cargar variables de entorno buscando en backend/.env o en el directorio raíz .env
const envPaths = [
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env')
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p });
    break;
  }
}

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Crear un pool de conexiones optimizado para MySQL
const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  port: DB_PORT || 3306,
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'reasons_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

console.log(`Pool de conexiones MySQL configurado para: ${DB_HOST || 'localhost'}:${DB_PORT || 3306}/${DB_NAME || 'reasons_db'}`);

module.exports = pool;
