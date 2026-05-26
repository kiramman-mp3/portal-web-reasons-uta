const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const validateResult = require('../middleware/validator');

const router = express.Router();

// POST /api/auth/login (Con Rate Limiting y Validación fuerte)
router.post(
  '/login',
  loginLimiter,
  [
    body('username')
      .trim()
      .notEmpty().withMessage('El usuario es requerido.')
      .isString().withMessage('El usuario debe ser una cadena de texto.')
      .escape(),
    body('password')
      .notEmpty().withMessage('La contraseña es requerida.')
  ],
  validateResult,
  authController.login
);

module.exports = router;
