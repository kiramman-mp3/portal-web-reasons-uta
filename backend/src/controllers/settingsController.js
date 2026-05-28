const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

// Obtener toda la configuración del portal
exports.getSettings = async (req, res) => {
  try {
    // 1. Obtener la fila principal de configuración (siempre id = 1)
    const [settingsRows] = await pool.query('SELECT * FROM site_settings WHERE id = 1');
    if (settingsRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la configuración del portal.'
      });
    }

    const settings = settingsRows[0];

    // 2. Obtener objetivos específicos
    const [objRows] = await pool.query('SELECT * FROM specific_objectives WHERE settings_id = 1 ORDER BY order_index ASC');
    settings.specific_objectives = objRows;

    // 3. Obtener líneas de investigación
    const [lineRows] = await pool.query('SELECT * FROM research_lines WHERE settings_id = 1 ORDER BY order_index ASC');
    settings.research_lines = lineRows;

    // 4. Obtener diapositivas del carrusel del Hero
    const [slideRows] = await pool.query('SELECT * FROM hero_slides ORDER BY order_index ASC');
    settings.hero_slides = slideRows;

    return res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración desde la base de datos.'
    });
  }
};

// Actualizar la configuración textual del portal
exports.updateSettings = async (req, res) => {
  const {
    group_name,
    institution,
    description,
    objective_general,
    mission,
    vision,
    primary_color,
    secondary_color,
    accent_color,
    contact_address,
    contact_location,
    contact_email,
    specific_objectives, // Array de strings o array de objetos
    research_lines       // Array de objetos { title, description, icon }
  } = req.body;

  const connection = await pool.getConnection();

  try {
    // Iniciar transacción para garantizar consistencia atómica
    await connection.beginTransaction();

    // 1. Actualizar tabla site_settings
    await connection.query(
      `UPDATE site_settings SET 
        group_name = ?, 
        institution = ?, 
        description = ?, 
        objective_general = ?, 
        mission = ?, 
        vision = ?, 
        primary_color = ?, 
        secondary_color = ?, 
        accent_color = ?, 
        contact_address = ?, 
        contact_location = ?, 
        contact_email = ? 
      WHERE id = 1`,
      [
        group_name,
        institution,
        description,
        objective_general,
        mission,
        vision,
        primary_color,
        secondary_color,
        accent_color,
        contact_address,
        contact_location,
        contact_email
      ]
    );

    // 2. Actualizar Objetivos Específicos (Eliminar viejos y reinsertar)
    if (specific_objectives && Array.isArray(specific_objectives)) {
      await connection.query('DELETE FROM specific_objectives WHERE settings_id = 1');
      for (let i = 0; i < specific_objectives.length; i++) {
        const objText = typeof specific_objectives[i] === 'object' ? specific_objectives[i].objective : specific_objectives[i];
        if (objText.trim()) {
          await connection.query(
            'INSERT INTO specific_objectives (settings_id, objective, order_index) VALUES (1, ?, ?)',
            [objText, i + 1]
          );
        }
      }
    }

    // 3. Actualizar Líneas de Investigación (Eliminar viejos y reinsertar)
    if (research_lines && Array.isArray(research_lines)) {
      await connection.query('DELETE FROM research_lines WHERE settings_id = 1');
      for (let i = 0; i < research_lines.length; i++) {
        const line = research_lines[i];
        if (line.title.trim()) {
          await connection.query(
            'INSERT INTO research_lines (settings_id, title, description, icon, `lines`, order_index) VALUES (1, ?, ?, ?, ?, ?)',
            [line.title, line.description, line.icon || 'bi-gear', line.lines || '', i + 1]
          );
        }
      }
    }

    // Confirmar transacción
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Configuración del portal actualizada exitosamente.'
    });

  } catch (error) {
    // Revertir cambios en caso de fallo
    await connection.rollback();
    console.error('Error al actualizar configuraciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración del portal.'
    });
  } finally {
    connection.release();
  }
};

// Actualizar logo institucional
exports.updateLogo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se subió ningún archivo de imagen para el logotipo.'
    });
  }

  try {
    const newLogoUrl = 'uploads/' + req.file.filename;

    // 1. Obtener logo antiguo para borrarlo físicamente
    const [settingsRows] = await pool.query('SELECT logo_url FROM site_settings WHERE id = 1');
    if (settingsRows.length > 0) {
      const oldLogoUrl = settingsRows[0].logo_url;
      // Borrar el archivo viejo si no es el archivo por defecto y si existe
      if (oldLogoUrl && oldLogoUrl !== 'uploads/logo_reasons.png') {
        const oldPath = path.join(__dirname, '../../', oldLogoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // 2. Actualizar base de datos
    await pool.query('UPDATE site_settings SET logo_url = ? WHERE id = 1', [newLogoUrl]);

    return res.status(200).json({
      success: true,
      message: 'Logotipo actualizado exitosamente.',
      logo_url: newLogoUrl
    });

  } catch (error) {
    console.error('Error al actualizar logotipo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el logotipo.'
    });
  }
};

// Agregar nueva diapositiva al carrusel
exports.addSlide = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se subió ninguna imagen para la diapositiva.'
    });
  }

  const { title, subtitle, order_index } = req.body;
  const imageUrl = 'uploads/' + req.file.filename;

  try {
    const orderIdx = parseInt(order_index) || 0;
    const [result] = await pool.query(
      'INSERT INTO hero_slides (image_url, title, subtitle, order_index) VALUES (?, ?, ?, ?)',
      [imageUrl, title || '', subtitle || '', orderIdx]
    );

    return res.status(201).json({
      success: true,
      message: 'Diapositiva agregada exitosamente.',
      data: {
        id: result.insertId,
        image_url: imageUrl,
        title: title || '',
        subtitle: subtitle || '',
        order_index: orderIdx
      }
    });
  } catch (error) {
    console.error('Error al agregar diapositiva:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al agregar la diapositiva.'
    });
  }
};

// Actualizar diapositiva existente
exports.updateSlide = async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, order_index } = req.body;

  try {
    // Verificar si existe la diapositiva
    const [existing] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la diapositiva.'
      });
    }

    const slide = existing[0];
    let imageUrl = slide.image_url;

    // Si se sube una nueva imagen, reemplazar y borrar la anterior
    if (req.file) {
      imageUrl = 'uploads/' + req.file.filename;
      
      const oldImage = slide.image_url;
      // No borrar las imágenes por defecto del semillero original
      const defaultImages = [
        'uploads/hero_reasons.png',
        'uploads/sustainability_research.png',
        'uploads/team_collaboration.png'
      ];
      if (oldImage && !defaultImages.includes(oldImage)) {
        const oldPath = path.join(__dirname, '../../', oldImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const orderIdx = order_index !== undefined ? parseInt(order_index) : slide.order_index;

    await pool.query(
      'UPDATE hero_slides SET image_url = ?, title = ?, subtitle = ?, order_index = ? WHERE id = ?',
      [imageUrl, title !== undefined ? title : slide.title, subtitle !== undefined ? subtitle : slide.subtitle, orderIdx, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Diapositiva actualizada exitosamente.',
      data: {
        id: parseInt(id),
        image_url: imageUrl,
        title: title !== undefined ? title : slide.title,
        subtitle: subtitle !== undefined ? subtitle : slide.subtitle,
        order_index: orderIdx
      }
    });

  } catch (error) {
    console.error('Error al actualizar diapositiva:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al actualizar la diapositiva.'
    });
  }
};

// Eliminar diapositiva del carrusel
exports.deleteSlide = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la diapositiva.'
      });
    }

    const slide = existing[0];
    const oldImage = slide.image_url;

    // Eliminar registro
    await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);

    // Borrar la imagen física si no es por defecto
    const defaultImages = [
      'uploads/hero_reasons.png',
      'uploads/sustainability_research.png',
      'uploads/team_collaboration.png'
    ];
    if (oldImage && !defaultImages.includes(oldImage)) {
      const oldPath = path.join(__dirname, '../../', oldImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Diapositiva eliminada exitosamente del carrusel.'
    });

  } catch (error) {
    console.error('Error al eliminar diapositiva:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar la diapositiva.'
    });
  }
};

