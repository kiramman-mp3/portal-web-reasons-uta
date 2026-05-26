const swaggerJSDoc = require('swagger-jsdoc');

// Configuración OpenAPI 3.0 completa y explícita para evitar errores de parseo
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
      },
      schemas: {
        LoginInput: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'AdminReasons2026!' }
          }
        },
        ContactInput: {
          type: 'object',
          required: ['names', 'email', 'subject', 'message'],
          properties: {
            names: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', example: 'juan.perez@example.com' },
            subject: { type: 'string', example: 'Consulta sobre proyectos sostenibles' },
            message: { type: 'string', example: 'Hola, me gustaría recibir más información sobre sus líneas de investigación en energías limpias.' }
          }
        },
        SettingsInput: {
          type: 'object',
          required: ['group_name', 'institution', 'description', 'objective_general', 'mission', 'vision', 'primary_color', 'secondary_color', 'accent_color', 'contact_address', 'contact_location', 'contact_email'],
          properties: {
            group_name: { type: 'string', example: 'REASONS' },
            institution: { type: 'string', example: 'Universidad Técnica de Ambato' },
            description: { type: 'string', example: 'Grupo de investigación institucional...' },
            objective_general: { type: 'string', example: 'Desarrollar investigación aplicada...' },
            mission: { type: 'string', example: 'Generar conocimiento científico...' },
            vision: { type: 'string', example: 'Ser referentes de sostenibilidad...' },
            primary_color: { type: 'string', example: '#0A5C36' },
            secondary_color: { type: 'string', example: '#F4A261' },
            accent_color: { type: 'string', example: '#1D3557' },
            contact_address: { type: 'string', example: 'Av. de Los Chasquis, Ambato' },
            contact_location: { type: 'string', example: 'Ambato - Ecuador' },
            contact_email: { type: 'string', example: 'reasons@uta.edu.ec' },
            specific_objectives: {
              type: 'array',
              items: { type: 'string' },
              example: ['Diseñar procesos sostenibles.', 'Generar proyectos de alto impacto.']
            },
            research_lines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Software y Ciencia de Datos' },
                  description: { type: 'string', example: 'Desarrollo de sistemas inteligentes...' },
                  icon: { type: 'string', example: 'bi-code-slash' }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Autenticación'],
          summary: 'Iniciar sesión administrativa',
          description: 'Permite autenticar a un administrador y retorna un token JWT válido por 24 horas.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginInput' }
              }
            }
          },
          responses: {
            200: { description: 'Autenticación exitosa.' },
            401: { description: 'Usuario o contraseña incorrectos.' }
          }
        }
      },
      '/api/settings': {
        get: {
          tags: ['Configuración Portal'],
          summary: 'Obtener configuración general y diseño del portal',
          description: 'Retorna los colores institucionales, logo, misión, visión, objetivos específicos y ejes de investigación.',
          responses: {
            200: { description: 'Datos obtenidos exitosamente.' }
          }
        },
        put: {
          tags: ['Configuración Portal'],
          summary: 'Actualizar configuración del portal',
          description: 'Actualiza los textos institucionales, colores y listas estructuradas.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SettingsInput' }
              }
            }
          },
          responses: {
            200: { description: 'Configuración actualizada exitosamente.' },
            401: { description: 'No autorizado (Token inválido o ausente).' }
          }
        }
      },
      '/api/settings/logo': {
        post: {
          tags: ['Configuración Portal'],
          summary: 'Subir nuevo logotipo institucional',
          description: 'Carga un nuevo archivo de logotipo de forma física en el servidor.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    logo: { type: 'string', format: 'binary', description: 'Archivo de imagen del logotipo (PNG, JPG, WEBP)' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Logotipo subido y aplicado exitosamente.' },
            401: { description: 'No autorizado.' }
          }
        }
      },
      '/api/researchers': {
        get: {
          tags: ['Investigadores'],
          summary: 'Obtener listado de investigadores',
          description: 'Retorna el equipo de trabajo del grupo con sus biografías, posiciones y fotos de perfil.',
          responses: {
            200: { description: 'Listado obtenido exitosamente.' }
          }
        },
        post: {
          tags: ['Investigadores'],
          summary: 'Crear nueva ficha de investigador',
          description: 'Registra un nuevo miembro del equipo. Soporta multipart para cargar la foto de perfil (5x5 cm).',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['names', 'institutional_email', 'bio', 'position'],
                  properties: {
                    names: { type: 'string', example: 'Dr. Diego Gómez' },
                    institutional_email: { type: 'string', example: 'dgomez@uta.edu.ec' },
                    bio: { type: 'string', example: 'Doctor en ingeniería ambiental...' },
                    position: { type: 'string', example: 'Director' },
                    orcid_link: { type: 'string', example: 'https://orcid.org/0000-...' },
                    facebook_link: { type: 'string' },
                    linkedin_link: { type: 'string' },
                    instagram_link: { type: 'string' },
                    telegram_link: { type: 'string' },
                    photo: { type: 'string', format: 'binary', description: 'Foto de perfil (jpeg, png)' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Investigador registrado exitosamente.' },
            401: { description: 'No autorizado.' }
          }
        }
      },
      '/api/researchers/{id}': {
        put: {
          tags: ['Investigadores'],
          summary: 'Actualizar ficha de investigador',
          description: 'Modifica los datos del investigador y/o actualiza su foto de perfil.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['names', 'institutional_email', 'bio', 'position'],
                  properties: {
                    names: { type: 'string', example: 'Dr. Diego Gómez' },
                    institutional_email: { type: 'string', example: 'dgomez@uta.edu.ec' },
                    bio: { type: 'string', example: 'Doctor en ingeniería ambiental...' },
                    position: { type: 'string', example: 'Director' },
                    orcid_link: { type: 'string' },
                    facebook_link: { type: 'string' },
                    linkedin_link: { type: 'string' },
                    instagram_link: { type: 'string' },
                    telegram_link: { type: 'string' },
                    photo: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Ficha actualizada exitosamente.' },
            404: { description: 'Investigador no encontrado.' }
          }
        },
        delete: {
          tags: ['Investigadores'],
          summary: 'Eliminar investigador',
          description: 'Remueve permanentemente al investigador y borra su archivo de imagen física.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'Investigador eliminado exitosamente.' },
            404: { description: 'Investigador no encontrado.' }
          }
        }
      },
      '/api/projects': {
        get: {
          tags: ['Proyectos'],
          summary: 'Obtener catálogo de proyectos',
          description: 'Retorna los proyectos científicos con sus objetivos, resultados y equipo de investigadores asociados.',
          responses: {
            200: { description: 'Catálogo obtenido exitosamente.' }
          }
        },
        post: {
          tags: ['Proyectos'],
          summary: 'Crear nuevo proyecto de investigación',
          description: 'Crea un proyecto y asocia investigadores principales o colaboradores.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'objectives', 'results'],
                  properties: {
                    title: { type: 'string', example: 'Mitigación de huella de carbono mediante algas' },
                    description: { type: 'string', example: 'Desarrollo de bio-reactores...' },
                    objectives: { type: 'string', example: 'Diseñar el bio-reactor, evaluar la eficiencia...' },
                    results: { type: 'string', example: 'Reducción del 40% de CO2 en laboratorio...' },
                    researcher_ids: { type: 'string', example: '[1, 2]', description: 'JSON array de IDs de investigadores asociados' },
                    image: { type: 'string', format: 'binary', description: 'Banner de portada del proyecto' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Proyecto registrado exitosamente.' }
          }
        }
      },
      '/api/projects/{id}': {
        put: {
          tags: ['Proyectos'],
          summary: 'Actualizar proyecto de investigación',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'objectives', 'results'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    objectives: { type: 'string' },
                    results: { type: 'string' },
                    researcher_ids: { type: 'string', example: '[1]' },
                    image: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Proyecto actualizado exitosamente.' }
          }
        },
        delete: {
          tags: ['Proyectos'],
          summary: 'Eliminar proyecto',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'Proyecto eliminado exitosamente.' }
          }
        }
      },
      '/api/publications': {
        get: {
          tags: ['Publicaciones Científicas'],
          summary: 'Obtener publicaciones indexadas',
          description: 'Retorna los artículos científicos, revistas, citas APA/IEEE, DOI y coautores.',
          responses: {
            200: { description: 'Listado obtenido exitosamente.' }
          }
        },
        post: {
          tags: ['Publicaciones Científicas'],
          summary: 'Registrar nueva publicación indexada',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'abstract', 'citation'],
                  properties: {
                    title: { type: 'string', example: 'Sustainable Energy in Active Operations' },
                    abstract: { type: 'string', example: 'This article presents an analysis of clean energy...' },
                    citation: { type: 'string', example: 'Gómez, D. (2026). Sustainable Energy...' },
                    doi_link: { type: 'string', example: 'https://doi.org/10.1016/...' },
                    author_ids: { type: 'string', example: '[1]', description: 'JSON array de IDs de investigadores coautores' },
                    cover: { type: 'string', format: 'binary', description: 'Portada de la revista' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Publicación registrada exitosamente.' }
          }
        }
      },
      '/api/publications/{id}': {
        put: {
          tags: ['Publicaciones Científicas'],
          summary: 'Actualizar publicación indexada',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'abstract', 'citation'],
                  properties: {
                    title: { type: 'string' },
                    abstract: { type: 'string' },
                    citation: { type: 'string' },
                    doi_link: { type: 'string' },
                    author_ids: { type: 'string', example: '[1]' },
                    cover: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Publicación actualizada.' }
          }
        },
        delete: {
          tags: ['Publicaciones Científicas'],
          summary: 'Eliminar publicación',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'Publicación eliminada.' }
          }
        }
      },
      '/api/contact': {
        post: {
          tags: ['Formulario de Contacto'],
          summary: 'Enviar un nuevo mensaje de contacto (Público)',
          description: 'Envía un mensaje al buzón administrativo del grupo de investigación.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactInput' }
              }
            }
          },
          responses: {
            201: { description: 'Mensaje enviado exitosamente.' }
          }
        },
        get: {
          tags: ['Formulario de Contacto'],
          summary: 'Ver buzón de mensajes (Privado)',
          description: 'Obtiene todos los mensajes recibidos para gestión administrativa.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Buzón obtenido exitosamente.' }
          }
        }
      },
      '/api/contact/{id}/status': {
        put: {
          tags: ['Formulario de Contacto'],
          summary: 'Actualizar estado del mensaje',
          description: 'Cambia el estado de lectura (unread, read, replied).',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['unread', 'read', 'replied'], example: 'read' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Estado actualizado exitosamente.' }
          }
        }
      },
      '/api/contact/{id}': {
        delete: {
          tags: ['Formulario de Contacto'],
          summary: 'Eliminar mensaje del buzón',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'Mensaje eliminado exitosamente.' }
          }
        }
      }
    }
  },
  apis: [] // Vacío ya que definimos toda la especificación explícitamente arriba
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
