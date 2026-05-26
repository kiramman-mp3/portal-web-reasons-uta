const pool = require('../config/db');

// Enviar un mensaje desde el portal (Público)
exports.sendMessage = async (req, res) => {
  const { names, email, subject, message } = req.body;

  try {
    // Al utilizar consultas parametrizadas, MySQL2 escapa automáticamente
    // todos los caracteres para evitar Inyección SQL de manera definitiva.
    // Además, express-validator en las rutas se encarga del escape anti-XSS y formato.
    await pool.query(
      'INSERT INTO contact_messages (names, email, subject, message) VALUES (?, ?, ?, ?)',
      [names, email, subject, message]
    );

    return res.status(201).json({
      success: true,
      message: 'Su mensaje ha sido enviado exitosamente al buzón del grupo REASONS.'
    });

  } catch (error) {
    console.error('Error al guardar mensaje de contacto:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error al procesar su mensaje. Por favor, intente más tarde.'
    });
  }
};

// Obtener todos los mensajes recibidos (Privado)
exports.getAllMessages = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY sent_at DESC');
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener mensajes de contacto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los mensajes del buzón.'
    });
  }
};

// Cambiar el estado de lectura de un mensaje (unread/read/replied) (Privado)
exports.updateMessageStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'unread', 'read', 'replied'

  const allowedStatus = ['unread', 'read', 'replied'];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Estado no válido. Solo se permite: unread, read, replied.'
    });
  }

  try {
    const [result] = await pool.query(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `El estado del mensaje ha sido actualizado a: ${status}.`
    });

  } catch (error) {
    console.error('Error al actualizar estado del mensaje:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el estado del mensaje.'
    });
  }
};

// Eliminar un mensaje del buzón (Privado)
exports.deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mensaje eliminado del buzón exitosamente.'
    });

  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar el mensaje del buzón.'
    });
  }
};
