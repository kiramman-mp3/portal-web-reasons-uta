const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const pool = require('./config/db');

// Cargar variables de entorno al inicio
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env')
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p });
    break;
  }
}

// Validar variables críticas obligatorias
if (!process.env.JWT_SECRET) {
  console.error('\x1b[31mError Crítico: La variable de entorno JWT_SECRET no está configurada.\x1b[0m');
  console.error('\x1b[33mEl servidor no se iniciará por razones de seguridad.\x1b[0m');
  process.exit(1);
}

// Importar configuración de Swagger
const swaggerSpec = require('./config/swagger');

// Importar rutas de la API
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const researchersRoutes = require('./routes/researchersRoutes');
const projectsRoutes = require('./routes/projectsRoutes');
const publicationsRoutes = require('./routes/publicationsRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// 1. Configurar variables de entorno y puerto
const PORT = process.env.PORT || 3000;

// 2. Middlewares de Seguridad Globales
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir que Angular consuma las imágenes expuestas estáticamente
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Habilitar CORS restrictivo para el frontend Angular (por defecto localhost:4200)
app.use(cors({
  origin: '*', // En producción se cambiaría a la URL de Angular para máxima seguridad
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Middlewares de lectura del Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Exponer directorio /uploads estáticamente para consumirse desde Angular
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 5. Exponer Documentación Interactiva Swagger (OpenAPI 3.0)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Montar enrutadores REST
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/researchers', researchersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/contact', contactRoutes);

// Ruta raíz explicativa
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor REST del Portal Institucional REASONS activo.',
    documentation: 'Puedes ver y probar la API interactiva en /api-docs'
  });
});

// 7. Middleware global para manejo de errores de sintaxis o de archivos
app.use((err, req, res, next) => {
  console.error('Error capturado globalmente:', err.message);

  // Si es un error de Multer de tamaño de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo subido es demasiado grande. El límite es de 5MB.'
    });
  }

  // Si es un error de Multer debido al filtro de tipo de formato
  if (err.message && err.message.includes('Formato de archivo no soportado')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Ocurrió un error inesperado en el servidor.'
  });
});

// 8. Inicializar servidor con verificación de base de datos
async function startServer() {
  try {
    console.log('Probando conectividad con base de datos MySQL...');
    await pool.query('SELECT 1');
    console.log('\x1b[32m✔ Conexión exitosa a la base de datos MySQL.\x1b[0m');

    app.listen(PORT, () => {
      console.log('==================================================');
      console.log(`🚀 SERVIDOR REST CORRIENDO EN PUERTO: ${PORT}`);
      console.log(`📝 DOCUMENTACIÓN INTERACTIVA (SWAGGER): http://localhost:${PORT}/api-docs`);
      console.log('==================================================');
    });
  } catch (err) {
    console.error('\x1b[31m✖ Error crítico al iniciar servidor: No se pudo conectar a MySQL.\x1b[0m');
    console.error('\x1b[33mDetalles:\x1b[0m', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
