const express = require('express');
const { body } = require('express-validator');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateResult = require('../middleware/validator');

const router = express.Router();

// GET /api/settings (Público)
router.get('/', settingsController.getSettings);

// PUT /api/settings (Privado)
router.put(
  '/',
  authMiddleware,
  [
    body('group_name')
      .trim()
      .notEmpty().withMessage('El nombre del grupo es requerido.')
      .escape(),
    body('institution')
      .trim()
      .notEmpty().withMessage('La institución es requerida.')
      .escape(),
    body('description')
      .trim()
      .notEmpty().withMessage('La descripción es requerida.')
      .escape(),
    body('objective_general')
      .trim()
      .notEmpty().withMessage('El objetivo general es requerido.')
      .escape(),
    body('mission')
      .trim()
      .notEmpty().withMessage('La misión es requerida.')
      .escape(),
    body('vision')
      .trim()
      .notEmpty().withMessage('La visión es requerida.')
      .escape(),
    body('primary_color')
      .trim()
      .isHexColor().withMessage('El color primario debe ser un código HEX válido.'),
    body('secondary_color')
      .trim()
      .isHexColor().withMessage('El color secundario debe ser un código HEX válido.'),
    body('accent_color')
      .trim()
      .isHexColor().withMessage('El color de realce debe ser un código HEX válido.'),
    body('contact_address')
      .trim()
      .notEmpty().withMessage('La dirección de contacto es requerida.')
      .escape(),
    body('contact_location')
      .trim()
      .notEmpty().withMessage('La ubicación es requerida.')
      .escape(),
    body('contact_email')
      .trim()
      .isEmail().withMessage('Debe ingresar un correo de contacto válido.')
      .normalizeEmail(),
    body('specific_objectives')
      .optional()
      .isArray().withMessage('Los objetivos específicos deben ser un listado.'),
    body('research_lines')
      .optional()
      .isArray().withMessage('Las líneas de investigación deben ser un listado.')
  ],
  validateResult,
  settingsController.updateSettings
);

// POST /api/settings/logo (Privado)
router.post(
  '/logo',
  authMiddleware,
  upload.single('logo'),
  settingsController.updateLogo
);

// Gestión del Carrusel del Hero (Privado)
// POST /api/settings/slides (Agregar diapositiva)
router.post(
  '/slides',
  authMiddleware,
  upload.single('image'),
  settingsController.addSlide
);

// PUT /api/settings/slides/:id (Actualizar diapositiva)
router.put(
  '/slides/:id',
  authMiddleware,
  upload.single('image'),
  settingsController.updateSlide
);

// DELETE /api/settings/slides/:id (Eliminar diapositiva)
router.delete(
  '/slides/:id',
  authMiddleware,
  settingsController.deleteSlide
);

module.exports = router;
