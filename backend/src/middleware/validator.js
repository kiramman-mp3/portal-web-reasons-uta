const { validationResult } = require('express-validator');

// Validador de resultados de express-validator
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Formatear los errores de validación de forma amigable
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados.',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};
