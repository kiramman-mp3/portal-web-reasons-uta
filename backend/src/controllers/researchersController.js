const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

// Obtener todos los investigadores
exports.getAllResearchers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM researchers ORDER BY id DESC');
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener investigadores:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el equipo de investigación.'
    });
  }
};

// Crear un investigador
exports.createResearcher = async (req, res) => {
  const {
    names,
    orcid_link,
    facebook_link,
    linkedin_link,
    instagram_link,
    telegram_link,
    institutional_email,
    bio,
    position
  } = req.body;

  let photo_url = 'uploads/default_avatar.png'; // Foto por defecto
  if (req.file) {
    photo_url = 'uploads/' + req.file.filename;
  }

  try {
    // Validar unicidad del correo electrónico
    const [existing] = await pool.query('SELECT id FROM researchers WHERE institutional_email = ?', [institutional_email]);
    if (existing.length > 0) {
      // Si se subió un archivo físico y dio error, debemos borrarlo para no dejar basura
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'El correo institucional ingresado ya pertenece a otro investigador.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO researchers 
        (names, orcid_link, facebook_link, linkedin_link, instagram_link, telegram_link, institutional_email, bio, position, photo_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [names, orcid_link, facebook_link, linkedin_link, instagram_link, telegram_link, institutional_email, bio, position, photo_url]
    );

    return res.status(201).json({
      success: true,
      message: 'Investigador registrado exitosamente.',
      data: {
        id: result.insertId,
        names,
        photo_url
      }
    });

  } catch (error) {
    console.error('Error al crear investigador:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al registrar el investigador.'
    });
  }
};

// Actualizar investigador
exports.updateResearcher = async (req, res) => {
  const { id } = req.params;
  const {
    names,
    orcid_link,
    facebook_link,
    linkedin_link,
    instagram_link,
    telegram_link,
    institutional_email,
    bio,
    position
  } = req.body;

  try {
    // 1. Obtener registro actual
    const [currentRows] = await pool.query('SELECT * FROM researchers WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Investigador no encontrado.'
      });
    }

    const researcher = currentRows[0];
    let photo_url = researcher.photo_url;

    // 2. Validar que el nuevo correo no esté repetido
    const [existing] = await pool.query('SELECT id FROM researchers WHERE institutional_email = ? AND id != ?', [institutional_email, id]);
    if (existing.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'El correo institucional ingresado ya pertenece a otro investigador.'
      });
    }

    // 3. Si se sube una nueva foto, actualizar y borrar la vieja
    if (req.file) {
      photo_url = 'uploads/' + req.file.filename;

      // Borrar foto vieja si existe y no es la por defecto
      if (researcher.photo_url && researcher.photo_url !== 'uploads/default_avatar.png') {
        const oldPath = path.join(__dirname, '../../', researcher.photo_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // 4. Actualizar base de datos
    await pool.query(
      `UPDATE researchers SET 
        names = ?, 
        orcid_link = ?, 
        facebook_link = ?, 
        linkedin_link = ?, 
        instagram_link = ?, 
        telegram_link = ?, 
        institutional_email = ?, 
        bio = ?, 
        position = ?, 
        photo_url = ? 
      WHERE id = ?`,
      [names, orcid_link, facebook_link, linkedin_link, instagram_link, telegram_link, institutional_email, bio, position, photo_url, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Investigador actualizado exitosamente.',
      data: {
        id,
        names,
        photo_url
      }
    });

  } catch (error) {
    console.error('Error al actualizar investigador:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el investigador.'
    });
  }
};

// Eliminar investigador
exports.deleteResearcher = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Obtener foto del investigador
    const [rows] = await pool.query('SELECT photo_url FROM researchers WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Investigador no encontrado.'
      });
    }

    const { photo_url } = rows[0];

    // 2. Eliminar de la base de datos
    await pool.query('DELETE FROM researchers WHERE id = ?', [id]);

    // 3. Borrar foto física del servidor
    if (photo_url && photo_url !== 'uploads/default_avatar.png') {
      const filePath = path.join(__dirname, '../../', photo_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Investigador eliminado exitosamente.'
    });

  } catch (error) {
    console.error('Error al eliminar investigador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar el investigador.'
    });
  }
};
