const express = require('express');
const { body } = require('express-validator');
const projectsController = require('../controllers/projectsController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateResult = require('../middleware/validator');

const router = express.Router();

// GET /api/projects (Público)
router.get('/', projectsController.getAllProjects);

// POST /api/projects (Privado)
router.post(
  '/',
  authMiddleware,
  upload.single('image'), // Primero procesar Multer para subir la foto del proyecto
  upload.checkImageSignature, // Validar firma de archivo real (Magic Bytes)
  [
    body('title')
      .trim()
      .notEmpty().withMessage('El título del proyecto es requerido.')
      .escape(),
    body('description')
      .trim()
      .notEmpty().withMessage('La descripción es requerida.')
      .escape(),
    body('objectives')
      .trim()
      .notEmpty().withMessage('Los objetivos son requeridos.')
      .escape(),
    body('results')
      .trim()
      .notEmpty().withMessage('Los resultados son requeridos.')
      .escape(),
    body('researcher_ids')
      .optional()
      .custom(val => {
        // Validar que researcher_ids sea un array decodificable en JSON si se envía como string
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            if (!Array.isArray(parsed)) throw new Error();
          } catch (e) {
            throw new Error('El listado de investigadores debe ser un array de identificadores válido.');
          }
        }
        return true;
      })
  ],
  validateResult,
  projectsController.createProject
);

// PUT /api/projects/:id (Privado)
router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  upload.checkImageSignature,
  [
    body('title')
      .trim()
      .notEmpty().withMessage('El título del proyecto es requerido.')
      .escape(),
    body('description')
      .trim()
      .notEmpty().withMessage('La descripción es requerida.')
      .escape(),
    body('objectives')
      .trim()
      .notEmpty().withMessage('Los objetivos son requeridos.')
      .escape(),
    body('results')
      .trim()
      .notEmpty().withMessage('Los resultados son requeridos.')
      .escape(),
    body('researcher_ids')
      .optional()
      .custom(val => {
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            if (!Array.isArray(parsed)) throw new Error();
          } catch (e) {
            throw new Error('El listado de investigadores debe ser un array de identificadores válido.');
          }
        }
        return true;
      })
  ],
  validateResult,
  projectsController.updateProject
);

// DELETE /api/projects/:id (Privado)
router.delete('/:id', authMiddleware, projectsController.deleteProject);

module.exports = router;
