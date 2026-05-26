const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// Cargar variables de entorno del archivo .env en la raíz
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('\x1b[31mError: No se encontró el archivo .env en la raíz del proyecto.\x1b[0m');
  process.exit(1);
}
require('dotenv').config({ path: envPath });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\x1b[36m==================================================\x1b[0m');
  console.log('\x1b[36m   CREADOR DE ADMINISTRADORES - PORTAL REASONS    \x1b[0m');
  console.log('\x1b[36m==================================================\x1b[0m');

  try {
    const username = await askQuestion('Ingrese el nombre de usuario (ej: jgomez): ');
    if (!username.trim()) {
      console.log('\x1b[31mEl usuario no puede estar vacío.\x1b[0m');
      rl.close();
      return;
    }

    const password = await askQuestion('Ingrese la contraseña para el nuevo usuario: ');
    if (!password || password.length < 6) {
      console.log('\x1b[31mLa contraseña debe tener al menos 6 caracteres.\x1b[0m');
      rl.close();
      return;
    }

    console.log('Generando hash de contraseña seguro con bcrypt (12 rondas)...');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('Conectando a la base de datos MySQL...');
    const connection = await mysql.createConnection({
      host: DB_HOST || 'localhost',
      port: DB_PORT || 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'reasons_db'
    });

    console.log(`Verificando si el usuario '${username}' ya existe...`);
    const [existing] = await connection.query('SELECT id FROM users WHERE username = ?', [username]);
    
    if (existing.length > 0) {
      console.log(`\x1b[33mEl usuario '${username}' ya existe. ¿Desea actualizar su contraseña? (s/n): \x1b[0m`);
      const response = await askQuestion('');
      if (response.toLowerCase() === 's') {
        await connection.query('UPDATE users SET password_hash = ? WHERE username = ?', [passwordHash, username]);
        console.log(`\x1b[32m✔ Contraseña del usuario '${username}' actualizada exitosamente.\x1b[0m`);
      } else {
        console.log('Operación cancelada.');
      }
    } else {
      await connection.query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, passwordHash, 'admin']);
      console.log(`\x1b[32m✔ Usuario administrador '${username}' creado exitosamente.\x1b[0m`);
    }

    await connection.end();
  } catch (error) {
    console.error('\x1b[31m✖ Ocurrió un error al registrar el administrador:\x1b[0m');
    console.error(error.message);
  } finally {
    rl.close();
  }
}

createAdmin();
