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

// Middleware para validar la firma real de la imagen en disco (Magic Bytes)
upload.checkImageSignature = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    
    // Leer los primeros 12 bytes del archivo
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    // Verificar firmas mágicas (Magic Bytes)
    // JPEG: FF D8 FF
    const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    
    // WEBP: 'RIFF' a los 0-4 bytes y 'WEBP' a los 8-12 bytes
    const isWebp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';

    if (!isJpg && !isPng && !isWebp) {
      // Eliminar el archivo físico malicioso o inválido
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'Firma de archivo inválida. El archivo subido no es una imagen real (JPEG/PNG/WEBP).'
      });
    }

    next();
  } catch (error) {
    console.error('Error al validar la firma de la imagen:', error);
    // Asegurar que el archivo sea borrado si ocurre algún error de lectura
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al validar la integridad de la imagen.'
    });
  }
};

module.exports = upload;
