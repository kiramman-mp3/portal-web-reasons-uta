const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Obtener cabecera de autorización
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó un token de seguridad.'
    });
  }

  // El formato debe ser "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Formato de token inválido. Debe ser de tipo Bearer.'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjuntar el payload decodificado a la solicitud
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado. Acceso no autorizado.'
    });
  }
};
