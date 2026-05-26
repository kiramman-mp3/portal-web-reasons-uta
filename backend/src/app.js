const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

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
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permitir que Angular consuma las imágenes expuestas estáticamente
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

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Ocurrió un error inesperado en el servidor.'
  });
});

// 8. Inicializar servidor
app.listen(PORT, () => {
  console.log('==================================================');
  console.log(`🚀 SERVIDOR REST CORRIENDO EN PUERTO: ${PORT}`);
  console.log(`📝 DOCUMENTACIÓN INTERACTIVA (SWAGGER): http://localhost:${PORT}/api-docs`);
  console.log('==================================================');
});

module.exports = app;
