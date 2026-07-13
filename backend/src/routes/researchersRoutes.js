const express = require('express');
const { body } = require('express-validator');
const researchersController = require('../controllers/researchersController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateResult = require('../middleware/validator');

const router = express.Router();

// GET /api/researchers (Público)
router.get('/', researchersController.getAllResearchers);

// POST /api/researchers (Privado)
router.post(
  '/',
  authMiddleware,
  upload.single('photo'), // Primero se procesa Multer para poblar req.body y req.file
  upload.checkImageSignature, // Validar firma de archivo real (Magic Bytes)
  [
    body('names')
      .trim()
      .notEmpty().withMessage('Los nombres y apellidos son requeridos.')
      .escape(),
    body('institutional_email')
      .trim()
      .isEmail().withMessage('Debe ingresar un correo institucional válido.')
      .normalizeEmail(),
    body('bio')
      .trim()
      .notEmpty().withMessage('La biografía profesional es requerida.')
      .escape(),
    body('position')
      .trim()
      .notEmpty().withMessage('La posición en el grupo es requerida.')
      .escape(),
    body('orcid_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace ORCID debe ser una URL válida.'),
    body('facebook_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace de Facebook debe ser una URL válida.'),
    body('linkedin_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace de LinkedIn debe ser una URL válida.'),
    body('instagram_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace de Instagram debe ser una URL válida.'),
    body('telegram_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace de Telegram debe ser una URL válida.')
  ],
  validateResult,
  researchersController.createResearcher
);

// PUT /api/researchers/:id (Privado)
router.put(
  '/:id',
  authMiddleware,
  upload.single('photo'),
  upload.checkImageSignature,
  [
    body('names')
      .trim()
      .notEmpty().withMessage('Los nombres y apellidos son requeridos.')
      .escape(),
    body('institutional_email')
      .trim()
      .isEmail().withMessage('Debe ingresar un correo institucional válido.')
      .normalizeEmail(),
    body('bio')
      .trim()
      .notEmpty().withMessage('La biografía profesional es requerida.')
      .escape(),
    body('position')
      .trim()
      .notEmpty().withMessage('La posición en el grupo es requerida.')
      .escape(),
    body('orcid_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace ORCID debe ser una URL válida.'),
    body('facebook_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace de Facebook debe ser una URL válida.'),
    body('linkedin_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace de LinkedIn debe ser una URL válida.'),
    body('instagram_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace de Instagram debe ser una URL válida.'),
    body('telegram_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace de Telegram debe ser una URL válida.')
  ],
  validateResult,
  researchersController.updateResearcher
);

// DELETE /api/researchers/:id (Privado)
router.delete('/:id', authMiddleware, researchersController.deleteResearcher);

module.exports = router;
