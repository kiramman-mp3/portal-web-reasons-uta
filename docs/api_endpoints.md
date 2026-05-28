# Catálogo de Endpoints de la API REST - REASONS

Esta API REST está construida con **Node.js, Express y MySQL**. Expone la documentación viva a través de Swagger UI en la ruta `/api-docs`.

## Seguridad y Autenticación
*   Las peticiones de escritura (`POST`, `PUT`, `DELETE`) están protegidas mediante un token **JWT** que debe enviarse en la cabecera `Authorization: Bearer <token>`.
*   Las peticiones `GET` son públicas.
*   El endpoint `/api/contact` (POST) es público pero cuenta con **Rate Limiting** para prevenir spam y denegación de servicio.

---

## 1. Módulo de Autenticación (`/api/auth`)

### POST `/api/auth/login`
Inicia sesión como administrador.
*   **Acceso**: Público
*   **Cuerpo (JSON)**:
    ```json
    {
      "username": "admin",
      "password": "AdminReasons2026!"
    }
    ```
*   **Respuesta Exitosa (200 OK)**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "username": "admin",
        "role": "admin"
      }
    }
    ```

---

## 2. Configuración y Personalización del Sitio (`/api/settings`)

### GET `/api/settings`
Obtiene toda la configuración del portal (logo, colores, objetivos, líneas de investigación, información de contacto).
*   **Acceso**: Público
*   **Respuesta Exitosa (200 OK)**:
    ```json
    {
      "id": 1,
      "logo_url": "uploads/logo_reasons.png",
      "group_name": "REASONS",
      "institution": "Universidad Técnica de Ambato",
      "description": "...",
      "objective_general": "...",
      "mission": "...",
      "vision": "...",
      "primary_color": "#0A5C36",
      "secondary_color": "#F4A261",
      "accent_color": "#1D3557",
      "contact_address": "...",
      "contact_location": "...",
      "contact_email": "...",
      "specific_objectives": [
        { "id": 1, "objective": "...", "order_index": 1 }
      ],
      "research_lines": [
        { "id": 1, "title": "...", "description": "...", "icon": "bi-palette", "order_index": 1 }
      ]
    }
    ```

### PUT `/api/settings`
Actualiza la configuración textual del portal.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo (JSON)**:
    ```json
    {
      "group_name": "REASONS",
      "institution": "Universidad Técnica de Ambato",
      "description": "...",
      "objective_general": "...",
      "mission": "...",
      "vision": "...",
      "primary_color": "#0A5C36",
      "secondary_color": "#F4A261",
      "accent_color": "#1D3557",
      "contact_address": "...",
      "contact_location": "...",
      "contact_email": "...",
      "specific_objectives": ["Obj 1", "Obj 2"],
      "research_lines": [
        { "id": 1, "title": "...", "description": "...", "icon": "bi-palette" }
      ]
    }
    ```

### POST `/api/settings/logo`
Sube un nuevo logo corporativo.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data` con campo `logo` (Archivo de imagen)
*   **Respuesta (200 OK)**:
    ```json
    {
      "success": true,
      "logo_url": "uploads/1706859384729-logo.png"
    }
    ```

### POST `/api/settings/slides`
Añade una nueva diapositiva al carrusel del Hero de la página de inicio.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data`
    *   Campos de texto: `title` (opcional), `subtitle` (opcional), `order_index` (opcional).
    *   Archivo de imagen: `image` (Imagen del slide).

### PUT `/api/settings/slides/:id`
Actualiza una diapositiva existente del carrusel del Hero.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data` (Opcional `image`).

### DELETE `/api/settings/slides/:id`
Elimina una diapositiva del carrusel y borra físicamente su imagen del servidor.
*   **Acceso**: Protegido (JWT)

---

## 3. Módulo de Investigadores (`/api/researchers`)

### GET `/api/researchers`
Obtiene todos los investigadores.
*   **Acceso**: Público

### POST `/api/researchers`
Crea un nuevo investigador.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data`
    *   Campos de texto: `names`, `orcid_link`, `facebook_link`, `linkedin_link`, `instagram_link`, `telegram_link`, `institutional_email`, `bio`, `position`.
    *   Archivo de imagen: `photo` (Imagen de perfil 5x5 cm).

### PUT `/api/researchers/:id`
Actualiza un investigador existente.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data` (Los mismos campos, opcional `photo`).

### DELETE `/api/researchers/:id`
Elimina un investigador.
*   **Acceso**: Protegido (JWT)

---

## 4. Módulo de Proyectos (`/api/projects`)

### GET `/api/projects`
Obtiene el catálogo de proyectos de investigación.
*   **Acceso**: Público

### POST `/api/projects`
Crea un nuevo proyecto de investigación.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data`
    *   Campos de texto: `title`, `description`, `objectives`, `results`, `researcher_ids` (JSON Array con IDs de investigadores participantes del grupo).
    *   Archivo de imagen: `image` (Imagen de portada del proyecto).

### PUT `/api/projects/:id`
Actualiza un proyecto.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data` (Opcional `image`).

### DELETE `/api/projects/:id`
Elimina un proyecto.
*   **Acceso**: Protegido (JWT)

---

## 5. Módulo de Publicaciones Científicas (`/api/publications`)

### GET `/api/publications`
Obtiene la lista de artículos científicos.
*   **Acceso**: Público

### POST `/api/publications`
Registra un artículo científico.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data`
    *   Campos de texto: `title`, `abstract`, `citation`, `doi_link`, `author_ids` (JSON Array con IDs de investigadores coautores).
    *   Archivo de imagen: `cover` (Imagen de portada de la revista).

### PUT `/api/publications/:id`
Actualiza una publicación.
*   **Acceso**: Protegido (JWT)
*   **Cuerpo**: `multipart/form-data` (Opcional `cover`).

### DELETE `/api/publications/:id`
Elimina una publicación.
*   **Acceso**: Protegido (JWT)

---

## 6. Buzón y Formulario de Contacto (`/api/contact`)

### POST `/api/contact`
Envía un mensaje al buzón del grupo.
*   **Acceso**: Público (Con Rate Limiting y Saneamiento Anti-XSS)
*   **Cuerpo (JSON)**:
    ```json
    {
      "names": "Juan Pérez",
      "email": "juan.perez@example.com",
      "subject": "Consulta sobre proyectos de energía",
      "message": "Hola, estoy muy interesado en colaborar..."
    }
    ```

### GET `/api/contact`
Obtiene la lista de mensajes del buzón (Bandeja de entrada).
*   **Acceso**: Protegido (JWT)

### PUT `/api/contact/:id/status`
Actualiza el estado de lectura de un mensaje (`unread`, `read`, `replied`).
*   **Acceso**: Protegido (JWT)
*   **Cuerpo (JSON)**:
    ```json
    {
      "status": "read"
    }
    ```

### DELETE `/api/contact/:id`
Elimina un mensaje del buzón.
*   **Acceso**: Protegido (JWT)
