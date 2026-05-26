# Medidas de Seguridad Implementadas - Portal REASONS

El portal institucional aplica una estrategia de seguridad por capas para proteger la integridad de la base de datos, evitar el abuso de recursos y garantizar que solo administradores autenticados puedan modificar la información pública.

---

## 1. Seguridad en la Base de Datos (MySQL)

### Consultas Parametrizadas (Placeholders)
Para erradicar por completo las inyecciones SQL (SQLi), la API utiliza el driver `mysql2/promise` combinándolo con consultas preparadas nativas. Nunca se concatenan variables en las consultas SQL.
*   **Mal uso (Vulnerable)**: `connection.query("SELECT * FROM users WHERE username = '" + username + "'")`
*   **Uso Seguro (Implementado)**: `connection.query("SELECT * FROM users WHERE username = ?", [username])`

---

## 2. Seguridad en el Servidor REST (Backend Express)

### Cabeceras de Seguridad con Helmet
El middleware `helmet` configura cabeceras HTTP que fortalecen al servidor contra vectores de ataque conocidos:
*   `X-Frame-Options`: Configurado en `SAMEORIGIN` para prevenir ataques de Clickjacking.
*   `X-Content-Type-Options`: Configurado en `nosniff` para evitar el "Mime Sniffing".
*   `Content-Security-Policy` (CSP): Mitiga ataques Cross-Site Scripting (XSS) y de inyección de datos controlando el origen de los recursos.

### Control de Orígenes Cruzados (CORS)
Restringe el acceso a la API REST. Solo se permiten solicitudes de dominios específicos (como `http://localhost:4200` en desarrollo), rechazando conexiones no autorizadas del exterior.

### Limitador de Tasa (Rate Limiting)
Previene ataques de fuerza bruta en el login y denegación de servicio (DoS) por spam de mensajes en el formulario de contacto.
*   **Login**: Máximo 5 intentos por cada 15 minutos por IP.
*   **Contacto**: Máximo 3 envíos por cada 15 minutos por IP.

### Autenticación con JSON Web Tokens (JWT)
*   **Cifrado**: Contraseñas cifradas usando `bcryptjs` con un factor de coste de **12 rondas** de sal, lo que dificulta enormemente los ataques de diccionario y Rainbow tables.
*   **Sesiones sin Estado**: Al iniciar sesión correctamente, el servidor genera un token JWT firmado mediante una clave secreta fuerte (`JWT_SECRET`).
*   **Expiración**: Los tokens expiran automáticamente en 24 horas y se requieren en la cabecera `Authorization: Bearer <token>` para todas las rutas del CRUD.

### Saneamiento de Datos y Validación
Usando `express-validator` en todos los endpoints receptores de datos:
*   **Validación de Tipo**: Email validado con `.isEmail()`, strings con `.isString()`, números de orden con `.isInt()`.
*   **Saneamiento Anti-XSS**: Escape de caracteres especiales (`.escape()`) y eliminación de espacios en blanco (`.trim()`) para anular cualquier script HTML malicioso inyectado en campos de texto (ej. en el formulario de contacto o en las biografías de investigadores).
*   **Límites de Longitud**: Evita desbordamiento de búfer o denegaciones de servicio controlando los límites (`.isLength({ max: 200 })`).

### Validación Estricta de Archivos con Multer
El middleware de subida de archivos está configurado de forma estricta:
*   **Límite de Peso**: Máximo 5 Megabytes por archivo para evitar llenar el disco duro del servidor con archivos gigantescos.
*   **Filtro MIME**: Solo se aceptan extensiones de imagen estándar (`image/jpeg`, `image/png`, `image/webp`). Cualquier otro formato (como ejecutables, scripts `.js` o archivos `.php`) es rechazado de inmediato.
*   **Nombre de Archivos Seguro**: Los archivos se renombran de manera programada (`[timestamp]-[random_uuid]-[original_extension]`) para neutralizar ataques de sobreescritura de archivos del sistema.

---

## 3. Seguridad en el Cliente (Frontend Angular)

### Sanitización Nativa de Angular
El compilador y motor de renderizado de Angular aplica por defecto una fuerte política de sanitización que purga cualquier script malicioso antes de renderizar strings de la API en el DOM. Si se requiere renderizar HTML enriquecido de forma legítima, se utiliza el servicio `DomSanitizer` controlando los orígenes permitidos.

### Gestión Segura del Estado del Token
*   El token JWT se almacena de forma segura en el `localStorage` o `sessionStorage`.
*   Un interceptor HTTP de Angular (`auth.interceptor.ts`) intercepta las solicitudes salientes agregando automáticamente la cabecera `Authorization` si el usuario está autenticado.
*   Las guardias de ruta de Angular (`auth.guard.ts`) previenen que usuarios no autenticados accedan visualmente a la zona de administración.
