const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ruta física del directorio de subidas
const uploadDir = path.join(__dirname, '../../uploads');

// Crear la carpeta si por alguna razón no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Evitar colisiones usando la fecha actual y un número aleatorio
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanedName = file.originalname.replace(/\s+/g, '_'); // Reemplazar espacios por guiones bajos
    cb(null, uniqueSuffix + '-' + cleanedName);
  }
});

// Filtro estricto de tipo de archivos (MIME Types)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se permiten imágenes JPEG, PNG y WEBP.'), false);
  }
};

// Instancia de Multer configurada
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite estricto de 5 Megabytes
  }
});

module.exports = upload;
