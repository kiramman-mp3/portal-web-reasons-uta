const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Cargar variables de entorno desde la raíz del proyecto
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('\x1b[31mError: No se encontró el archivo .env en la raíz del proyecto.\x1b[0m');
  process.exit(1);
}
require('dotenv').config({ path: envPath });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function cleanDatabase() {
  console.log('\x1b[36m==================================================\x1b[0m');
  console.log('\x1b[36m    LIMPIADOR DE BASE DE DATOS - REASONS          \x1b[0m');
  console.log('\x1b[36m==================================================\x1b[0m');
  console.log(`Conectando al servidor MySQL en ${DB_HOST}:${DB_PORT} base de datos '${DB_NAME}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST || 'localhost',
      port: Number(DB_PORT) || 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'reasons_db'
    });

    console.log('\x1b[32m✔ Conexión exitosa a MySQL.\x1b[0m');
    console.log('\x1b[33mDesactivando restricciones de claves foráneas temporales...\x1b[0m');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Listado de tablas a limpiar en base al esquema real
    const tables = [
      'contact_messages',
      'project_researchers',
      'projects',
      'publication_authors',
      'publications',
      'researchers',
      'research_lines',
      'specific_objectives',
      'site_settings',
      'users'
    ];

    console.log('Vaciando tablas (TRUNCATE) para reiniciar autoincrementales...');
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`  ✔ Tabla '${table}' limpiada.`);
    }

    console.log('\x1b[33mRestableciendo restricciones de claves foráneas...\x1b[0m');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Re-semillar el administrador por defecto para evitar quedar bloqueado
    console.log('Insertando administrador por defecto (admin / AdminReasons2026!)...');
    const adminHash = '$2a$12$gpIJHgGk8ZTetRfIsnigFOOR.y6rf6U0D9fpIRP/gHKjT/C2TuQx.';
    await connection.query(`
      INSERT INTO users (id, username, password_hash, role) 
      VALUES (1, 'admin', ?, 'admin')
    `, [adminHash]);
    console.log('  ✔ Administrador creado.');

    // Insertar configuraciones básicas limpias para evitar que el sitio colapse sin datos
    console.log('Insertando configuración por defecto del portal...');
    await connection.query(`
      INSERT INTO site_settings (
        id, logo_url, group_name, institution, description, 
        objective_general, mission, vision, primary_color, 
        secondary_color, accent_color, contact_address, 
        contact_location, contact_email
      ) VALUES (
        1, 'uploads/logo_reasons.png', 'REASONS', 'Universidad Técnica de Ambato',
        'Grupo de investigación institucional de ingeniería sostenible y avanzada.',
        'Promover e impulsar la investigación en ingeniería sostenible y tecnológica.',
        'Generar conocimiento científico a través de la investigación ética y ambiental.',
        'Ser referentes de sostenibilidad aplicada para el año 2030.',
        '#0A5C36', '#F4A261', '#1D3557',
        'Facultad de Ingeniería en Sistemas, Electrónica e Industrial. Ambato – Ecuador.',
        'Universidad Técnica de Ambato. Ecuador.',
        'reasons@uta.edu.ec'
      )
    `);
    console.log('  ✔ Configuración por defecto creada.');

    // Crear las carpetas de subida vacías por si acaso fueron borradas
    const uploadsDir = path.join(__dirname, '../backend/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('  ✔ Carpeta backend/uploads recreada.');
    }

    console.log('\x1b[32m==================================================\x1b[0m');
    console.log('\x1b[32m✔ ¡BASE DE DATOS TOTALMENTE LIMPIA Y LISTA!       \x1b[0m');
    console.log('\x1b[32m==================================================\x1b[0m');
  } catch (error) {
    console.error('\x1b[31m✖ ERROR EN EL LIMPIADOR DE BASE DE DATOS:\x1b[0m');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanDatabase();
