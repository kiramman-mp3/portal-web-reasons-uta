const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Configuración OpenAPI 3.0 para Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST - Portal Institucional REASONS (UTA)',
      version: '1.0.0',
      description: `
Esta es la especificación interactiva del portal institucional del grupo de investigación **REASONS** (Universidad Técnica de Ambato).
Permite gestionar la configuración general del portal, equipo de investigadores, proyectos de investigación, publicaciones científicas y bandeja de mensajes del formulario de contacto.

### Capas de Seguridad
* **Público**: Rutas de lectura (\`GET\`) y envío de contacto (\`POST /api/contact\`).
* **Protegido (JWT)**: Rutas CRUD (\`POST\`, \`PUT\`, \`DELETE\`). Se debe iniciar sesión en \`/api/auth/login\`, copiar el token de respuesta y autorizarse usando el botón **Authorize** superior derecho (formato: \`Bearer <token>\`).
      `,
      contact: {
        name: 'Soporte Técnico REASONS - UTA',
        email: 'reasons@uta.edu.ec'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local Express'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese su token JWT recibido en el login. Ejemplo: "eyJhbGciOi..."'
        }
      }
    }
  },
  // Buscar rutas para documentar dinámicamente
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../app.js')
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
