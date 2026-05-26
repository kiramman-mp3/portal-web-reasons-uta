const rateLimit = require('express-rate-limit');

// Limitador de peticiones para Login (Máximo 5 peticiones por cada 15 minutos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión desde esta IP. Por favor, inténtelo de nuevo después de 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador de peticiones para Formulario de Contacto (Máximo 3 peticiones por cada 15 minutos)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3,
  message: {
    success: false,
    message: 'Ha enviado demasiados mensajes de contacto. Por favor, espere 15 minutos antes de enviar otro.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  contactLimiter
};
