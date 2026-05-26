const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');
const validateResult = require('../middleware/validator');

const router = express.Router();

// POST /api/contact (Público con Rate Limiting y Validación Anti-XSS fuerte)
router.post(
  '/',
  contactLimiter,
  [
    body('names')
      .trim()
      .notEmpty().withMessage('Los nombres y apellidos son requeridos.')
      .isString().withMessage('Los nombres deben ser una cadena de texto.')
      .isLength({ max: 150 }).withMessage('Los nombres no deben exceder los 150 caracteres.')
      .escape(),
    body('email')
      .trim()
      .notEmpty().withMessage('El correo electrónico es requerido.')
      .isEmail().withMessage('Debe ingresar una dirección de correo electrónico válida.')
      .normalizeEmail(),
    body('subject')
      .trim()
      .notEmpty().withMessage('El asunto es requerido.')
      .isLength({ max: 200 }).withMessage('El asunto no debe exceder los 200 caracteres.')
      .escape(),
    body('message')
      .trim()
      .notEmpty().withMessage('El mensaje es requerido.')
      .isLength({ min: 10, max: 2000 }).withMessage('El mensaje debe tener entre 10 y 2000 caracteres.')
      .escape()
  ],
  validateResult,
  contactController.sendMessage
);

// GET /api/contact (Privado - Visualizar bandeja de mensajes)
router.get('/', authMiddleware, contactController.getAllMessages);

// PUT /api/contact/:id/status (Privado - Cambiar estado a leido/respondido)
router.put(
  '/:id/status',
  authMiddleware,
  [
    body('status')
      .trim()
      .notEmpty().withMessage('El estado es requerido.')
      .isIn(['unread', 'read', 'replied']).withMessage('Estado inválido. Solo se permite: unread, read, replied.')
  ],
  validateResult,
  contactController.updateMessageStatus
);

// DELETE /api/contact/:id (Privado - Eliminar mensaje)
router.delete('/:id', authMiddleware, contactController.deleteMessage);

module.exports = router;
