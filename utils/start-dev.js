const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Validar que exista el archivo .env para el correcto funcionamiento
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.warn('\x1b[33m[REASONS] ADVERTENCIA: No se encontró el archivo .env en la raíz del proyecto.\x1b[0m');
  console.warn('\x1b[33m[REASONS] Por favor, copia .env.example a .env y configura tus credenciales de MySQL antes de iniciar.\x1b[0m');
}

console.log('\x1b[36m==================================================\x1b[0m');
console.log('\x1b[36m   INICIALIZANDO PORTAL REASONS (DEV SERVERS)    \x1b[0m');
console.log('\x1b[36m==================================================\x1b[0m');

// Helper para formatear logs con colores y prefijos limpios
function logWithPrefix(prefix, colorCode, data) {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed) {
      console.log(`${colorCode}[${prefix}]\x1b[0m ${trimmed}`);
    }
  });
}

// Configurar y asegurar variables de entorno del sistema (especialmente en Windows)
if (process.platform === 'win32') {
  const system32 = 'C:\\Windows\\System32';
  const winDir = 'C:\\Windows';
  
  // Prepend de System32 y Windows en todos los casos de registro (casing) del PATH
  const pathKeys = ['Path', 'PATH', 'path'];
  pathKeys.forEach(key => {
    // Mutamos process.env directamente para asegurar que Node.js resuelva cmd.exe internamente
    const currentPath = process.env[key] || '';
    if (!currentPath.includes(system32)) {
      process.env[key] = `${system32}${path.delimiter}${winDir}${currentPath ? path.delimiter + currentPath : ''}`;
    }
  });
  
  process.env.SystemRoot = winDir;
  process.env.ComSpec = `${system32}\\cmd.exe`;
}

const env = { ...process.env };

// 1. Iniciar Servidor Backend (Express + MySQL)
const backend = spawn('npm', ['run', 'start'], {
  cwd: path.join(__dirname, '../backend'),
  shell: true,
  env: env
});

backend.stdout.on('data', data => logWithPrefix('API-BACKEND', '\x1b[36m', data));
backend.stderr.on('data', data => logWithPrefix('API-BACKEND', '\x1b[31m', data));

// 2. Iniciar Servidor Frontend (Angular + Tailwind)
const frontend = spawn('npx', ['ng', 'serve', '--port', '4200'], {
  cwd: path.join(__dirname, '../frontend'),
  shell: true,
  env: env
});

frontend.stdout.on('data', data => logWithPrefix('SPA-FRONTEND', '\x1b[35m', data));
frontend.stderr.on('data', data => logWithPrefix('SPA-FRONTEND', '\x1b[31m', data));

// Control de salida sincronizada para no dejar procesos huérfanos
let isExiting = false;
function exitHandler(source, code) {
  if (isExiting) return;
  isExiting = true;
  console.log(`\n\x1b[33m[SISTEMA] El servidor ${source} finalizó. Deteniendo los procesos asociados...\x1b[0m`);
  
  try {
    backend.kill();
  } catch (e) {}
  try {
    frontend.kill();
  } catch (e) {}
  
  process.exit(code || 0);
}

backend.on('close', code => exitHandler('API-BACKEND', code));
frontend.on('close', code => exitHandler('SPA-FRONTEND', code));

// Capturar señales de salida de la terminal
process.on('SIGINT', () => exitHandler('TERMINAL (Ctrl+C)', 0));
process.on('SIGTERM', () => exitHandler('TERMINAL (SIGTERM)', 0));
process.on('exit', () => exitHandler('PROCESO', 0));
