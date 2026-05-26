const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Cargar variables de entorno del archivo .env en la raíz
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('\x1b[31mError: No se encontró el archivo .env en la raíz del proyecto.\x1b[0m');
  console.error('\x1b[33mPor favor, copia .env.example a .env y configura tus credenciales de MySQL.\x1b[0m');
  process.exit(1);
}
require('dotenv').config({ path: envPath });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function initializeDatabase() {
  console.log('\x1b[36m==================================================\x1b[0m');
  console.log('\x1b[36m   INICIALIZADOR DE BASE DE DATOS - REASONS       \x1b[0m');
  console.log('\x1b[36m==================================================\x1b[0m');
  console.log(`Conectando al servidor MySQL en ${DB_HOST}:${DB_PORT} como '${DB_USER}'...`);

  let connection;
  try {
    // 1. Conectar sin base de datos para poder crearla si no existe
    connection = await mysql.createConnection({
      host: DB_HOST || 'localhost',
      port: DB_PORT || 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || ''
    });

    console.log('\x1b[32m✔ Conexión al servidor MySQL exitosa.\x1b[0m');

    // 2. Crear la base de datos
    console.log(`Creando base de datos '${DB_NAME}' si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`\x1b[32m✔ Base de datos '${DB_NAME}' creada o confirmada.\x1b[0m`);

    // 3. Seleccionar la base de datos
    await connection.query(`USE \`${DB_NAME}\`;`);
    console.log(`\x1b[32m✔ Seleccionada base de datos '${DB_NAME}'.\x1b[0m`);

    // 4. Leer y ejecutar el script SQL docs/database_schema.sql
    const sqlPath = path.join(__dirname, '../docs/database_schema.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`No se pudo encontrar el archivo de esquema SQL en: ${sqlPath}`);
    }

    console.log('Leyendo el esquema SQL...');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir consultas SQL por punto y coma (;) asegurando ignorar comentarios y líneas vacías
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => {
        // Filtrar comentarios y consultas vacías
        if (!query) return false;
        const lines = query.split('\n');
        const nonCommentLines = lines.filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('#') && line.trim() !== '');
        return nonCommentLines.length > 0;
      });

    console.log(`Ejecutando ${queries.length} bloques de consultas SQL...`);

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i];
      try {
        await connection.query(q);
      } catch (err) {
        console.error(`\x1b[31mError al ejecutar la consulta #${i + 1}:\x1b[0m`);
        console.error(q);
        throw err;
      }
    }

    console.log('\x1b[32m==================================================\x1b[0m');
    console.log('\x1b[32m✔ ¡BASE DE DATOS INICIALIZADA EXITOSAMENTE!       \x1b[0m');
    console.log('\x1b[32m==================================================\x1b[0m');
  } catch (error) {
    console.error('\x1b[31m✖ ERROR EN LA INICIALIZACIÓN DE LA BASE DE DATOS:\x1b[0m');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
