const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

// Obtener todas las publicaciones
exports.getAllPublications = async (req, res) => {
  try {
    // 1. Obtener publicaciones
    const [publications] = await pool.query('SELECT * FROM publications ORDER BY id DESC');

    if (publications.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Obtener autores relacionados para todas las publicaciones (1 sola consulta para optimizar)
    const [relations] = await pool.query(`
      SELECT pa.publication_id, r.id as researcher_id, r.names, r.photo_url, pa.author_order
      FROM publication_authors pa
      JOIN researchers r ON pa.researcher_id = r.id
      ORDER BY pa.author_order ASC
    `);

    // 3. Mapear coautores a cada publicación
    const publicationsWithAuthors = publications.map(pub => {
      const authors = relations
        .filter(rel => rel.publication_id === pub.id)
        .map(rel => ({
          id: rel.researcher_id,
          names: rel.names,
          photo_url: rel.photo_url,
          author_order: rel.author_order
        }));

      return {
        ...pub,
        authors
      };
    });

    return res.status(200).json({
      success: true,
      data: publicationsWithAuthors
    });

  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los artículos científicos.'
    });
  }
};

// Crear una publicación científica
exports.createPublication = async (req, res) => {
  const { title, abstract, citation, doi_link, author_ids } = req.body;

  let journal_cover_url = 'uploads/default_journal.png'; // Imagen por defecto
  if (req.file) {
    journal_cover_url = 'uploads/' + req.file.filename;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insertar publicación
    const [pubResult] = await connection.query(
      `INSERT INTO publications (title, abstract, citation, doi_link, journal_cover_url) 
      VALUES (?, ?, ?, ?, ?)`,
      [title, abstract, citation, doi_link, journal_cover_url]
    );

    const publicationId = pubResult.insertId;

    // 2. Insertar autores relacionados (Muchos a Muchos)
    if (author_ids) {
      let ids = [];
      try {
        ids = typeof author_ids === 'string' ? JSON.parse(author_ids) : author_ids;
      } catch (e) {
        console.error('Error al decodificar author_ids:', e);
      }

      if (Array.isArray(ids) && ids.length > 0) {
        for (let i = 0; i < ids.length; i++) {
          const researcherId = ids[i];
          await connection.query(
            'INSERT INTO publication_authors (publication_id, researcher_id, author_order) VALUES (?, ?, ?)',
            [publicationId, researcherId, i + 1]
          );
        }
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Artículo científico registrado exitosamente.',
      data: {
        id: publicationId,
        title,
        journal_cover_url
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear publicación:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al registrar el artículo científico.'
    });
  } finally {
    connection.release();
  }
};

// Actualizar una publicación
exports.updatePublication = async (req, res) => {
  const { id } = req.params;
  const { title, abstract, citation, doi_link, author_ids } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Obtener publicación actual
    const [currentRows] = await connection.query('SELECT journal_cover_url FROM publications WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Artículo científico no encontrado.'
      });
    }

    const pub = currentRows[0];
    let journal_cover_url = pub.journal_cover_url;

    // 2. Si se sube una nueva portada, reemplazar
    if (req.file) {
      journal_cover_url = 'uploads/' + req.file.filename;

      if (pub.journal_cover_url && pub.journal_cover_url !== 'uploads/default_journal.png') {
        const oldPath = path.join(__dirname, '../../', pub.journal_cover_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // 3. Actualizar campos textuales
    await connection.query(
      `UPDATE publications SET 
        title = ?, 
        abstract = ?, 
        citation = ?, 
        doi_link = ?, 
        journal_cover_url = ? 
      WHERE id = ?`,
      [title, abstract, citation, doi_link, journal_cover_url, id]
    );

    // 4. Actualizar autores (Eliminar y reinsertar)
    if (author_ids) {
      await connection.query('DELETE FROM publication_authors WHERE publication_id = ?', [id]);

      let ids = [];
      try {
        ids = typeof author_ids === 'string' ? JSON.parse(author_ids) : author_ids;
      } catch (e) {
        console.error('Error al decodificar author_ids:', e);
      }

      if (Array.isArray(ids) && ids.length > 0) {
        for (let i = 0; i < ids.length; i++) {
          const researcherId = ids[i];
          await connection.query(
            'INSERT INTO publication_authors (publication_id, researcher_id, author_order) VALUES (?, ?, ?)',
            [id, researcherId, i + 1]
          );
        }
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Artículo científico actualizado exitosamente.',
      data: {
        id,
        title,
        journal_cover_url
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar publicación:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el artículo científico.'
    });
  } finally {
    connection.release();
  }
};

// Eliminar una publicación
exports.deletePublication = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Obtener imagen de la publicación
    const [rows] = await pool.query('SELECT journal_cover_url FROM publications WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artículo científico no encontrado.'
      });
    }

    const { journal_cover_url } = rows[0];

    // 2. Eliminar artículo de la DB (CASCADE se encarga de publication_authors)
    await pool.query('DELETE FROM publications WHERE id = ?', [id]);

    // 3. Eliminar archivo de portada físico
    if (journal_cover_url && journal_cover_url !== 'uploads/default_journal.png') {
      const filePath = path.join(__dirname, '../../', journal_cover_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Artículo científico eliminado exitosamente.'
    });

  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar el artículo científico.'
    });
  }
};
