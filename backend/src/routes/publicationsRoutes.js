const express = require('express');
const { body } = require('express-validator');
const publicationsController = require('../controllers/publicationsController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateResult = require('../middleware/validator');

const router = express.Router();

// GET /api/publications (Público)
router.get('/', publicationsController.getAllPublications);

// POST /api/publications (Privado)
router.post(
  '/',
  authMiddleware,
  upload.single('cover'), // Multer sube la portada de la revista
  upload.checkImageSignature, // Validar firma de archivo real (Magic Bytes)
  [
    body('title')
      .trim()
      .notEmpty().withMessage('El título del artículo es requerido.')
      .escape(),
    body('abstract')
      .trim()
      .notEmpty().withMessage('El resumen (abstract) es requerido.')
      .escape(),
    body('citation')
      .trim()
      .notEmpty().withMessage('La cita del artículo (APA/IEEE/etc.) es requerida.')
      .escape(),
    body('doi_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace DOI debe ser una URL válida.'),
    body('author_ids')
      .optional()
      .custom(val => {
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            if (!Array.isArray(parsed)) throw new Error();
          } catch (e) {
            throw new Error('El listado de coautores debe ser un array de identificadores válido.');
          }
        }
        return true;
      })
  ],
  validateResult,
  publicationsController.createPublication
);

// PUT /api/publications/:id (Privado)
router.put(
  '/:id',
  authMiddleware,
  upload.single('cover'),
  upload.checkImageSignature,
  [
    body('title')
      .trim()
      .notEmpty().withMessage('El título del artículo es requerido.')
      .escape(),
    body('abstract')
      .trim()
      .notEmpty().withMessage('El resumen (abstract) es requerido.')
      .escape(),
    body('citation')
      .trim()
      .notEmpty().withMessage('La cita del artículo (APA/IEEE/etc.) es requerida.')
      .escape(),
    body('doi_link')
      .optional({ checkFalsy: true })
      .trim()
      .isURL().withMessage('El enlace DOI debe ser una URL válida.'),
    body('author_ids')
      .optional()
      .custom(val => {
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            if (!Array.isArray(parsed)) throw new Error();
          } catch (e) {
            throw new Error('El listado de coautores debe ser un array de identificadores válido.');
          }
        }
        return true;
      })
  ],
  validateResult,
  publicationsController.updatePublication
);

// DELETE /api/publications/:id (Privado)
router.delete('/:id', authMiddleware, publicationsController.deletePublication);

module.exports = router;
