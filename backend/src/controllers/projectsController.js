const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

// Obtener catálogo de proyectos
exports.getAllProjects = async (req, res) => {
  try {
    // 1. Obtener proyectos
    const [projects] = await pool.query('SELECT * FROM projects ORDER BY id DESC');

    if (projects.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Obtener investigadores relacionados para todos los proyectos (1 sola consulta para optimizar)
    const [relations] = await pool.query(`
      SELECT pr.project_id, r.id as researcher_id, r.names, r.photo_url, r.position, pr.role_in_project
      FROM project_researchers pr
      JOIN researchers r ON pr.researcher_id = r.id
    `);

    // 3. Mapear investigadores a cada proyecto
    const projectsWithResearchers = projects.map(project => {
      const participants = relations
        .filter(rel => rel.project_id === project.id)
        .map(rel => ({
          id: rel.researcher_id,
          names: rel.names,
          photo_url: rel.photo_url,
          position: rel.position,
          role_in_project: rel.role_in_project
        }));

      return {
        ...project,
        participants
      };
    });

    return res.status(200).json({
      success: true,
      data: projectsWithResearchers
    });

  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el catálogo de proyectos.'
    });
  }
};

// Crear un proyecto
exports.createProject = async (req, res) => {
  const { title, description, objectives, results, researcher_ids } = req.body;

  let image_url = 'uploads/default_project.png'; // Imagen por defecto
  if (req.file) {
    image_url = 'uploads/' + req.file.filename;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insertar proyecto
    const [projResult] = await connection.query(
      `INSERT INTO projects (title, description, objectives, results, image_url) 
      VALUES (?, ?, ?, ?, ?)`,
      [title, description, objectives, results, image_url]
    );

    const projectId = projResult.insertId;

    // 2. Insertar participantes (Muchos a Muchos)
    if (researcher_ids) {
      let ids = [];
      try {
        ids = typeof researcher_ids === 'string' ? JSON.parse(researcher_ids) : researcher_ids;
      } catch (e) {
        console.error('Error al decodificar researcher_ids:', e);
      }

      if (Array.isArray(ids) && ids.length > 0) {
        for (const researcherId of ids) {
          await connection.query(
            'INSERT INTO project_researchers (project_id, researcher_id, role_in_project) VALUES (?, ?, ?)',
            [projectId, researcherId, 'Investigador']
          );
        }
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Proyecto de investigación registrado exitosamente.',
      data: {
        id: projectId,
        title,
        image_url
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear proyecto:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al registrar el proyecto de investigación.'
    });
  } finally {
    connection.release();
  }
};

// Actualizar un proyecto
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, objectives, results, researcher_ids } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Obtener proyecto actual
    const [currentRows] = await connection.query('SELECT image_url FROM projects WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado.'
      });
    }

    const project = currentRows[0];
    let image_url = project.image_url;

    // 2. Si se sube nueva imagen, reemplazar
    if (req.file) {
      image_url = 'uploads/' + req.file.filename;

      if (project.image_url && project.image_url !== 'uploads/default_project.png') {
        const oldPath = path.join(__dirname, '../../', project.image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // 3. Actualizar tabla principal
    await connection.query(
      `UPDATE projects SET 
        title = ?, 
        description = ?, 
        objectives = ?, 
        results = ?, 
        image_url = ? 
      WHERE id = ?`,
      [title, description, objectives, results, image_url, id]
    );

    // 4. Actualizar participantes (Eliminar y volver a insertar)
    if (researcher_ids) {
      await connection.query('DELETE FROM project_researchers WHERE project_id = ?', [id]);

      let ids = [];
      try {
        ids = typeof researcher_ids === 'string' ? JSON.parse(researcher_ids) : researcher_ids;
      } catch (e) {
        console.error('Error al decodificar researcher_ids:', e);
      }

      if (Array.isArray(ids) && ids.length > 0) {
        for (const researcherId of ids) {
          await connection.query(
            'INSERT INTO project_researchers (project_id, researcher_id, role_in_project) VALUES (?, ?, ?)',
            [id, researcherId, 'Investigador']
          );
        }
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Proyecto de investigación actualizado exitosamente.',
      data: {
        id,
        title,
        image_url
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar proyecto:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el proyecto de investigación.'
    });
  } finally {
    connection.release();
  }
};

// Eliminar un proyecto
exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Obtener imagen del proyecto
    const [rows] = await pool.query('SELECT image_url FROM projects WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado.'
      });
    }

    const { image_url } = rows[0];

    // 2. Eliminar proyecto (las relaciones project_researchers se eliminan por CASCADE)
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    // 3. Borrar imagen física
    if (image_url && image_url !== 'uploads/default_project.png') {
      const filePath = path.join(__dirname, '../../', image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Proyecto de investigación eliminado exitosamente.'
    });

  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar el proyecto.'
    });
  }
};
