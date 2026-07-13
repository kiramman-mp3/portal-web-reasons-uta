-- Schema SQL para MySQL
-- Nombre de la Base de Datos: reasons_db
-- Creado para: Portal Web Institucional del Grupo de Investigación REASONS (UTA)

-- CREATE DATABASE IF NOT EXISTS reasons_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE reasons_db;

-- 1. Configuración general administrable del portal
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logo_url VARCHAR(255) NOT NULL,
    group_name VARCHAR(150) NOT NULL,
    institution VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    objective_general TEXT NOT NULL,
    mission TEXT NOT NULL,
    vision TEXT NOT NULL,
    primary_color VARCHAR(7) DEFAULT '#0A5C36', -- Verde institucional de la UTA
    secondary_color VARCHAR(7) DEFAULT '#F4A261', -- Color secundario (Sostenibilidad)
    accent_color VARCHAR(7) DEFAULT '#1D3557', -- Color de realce
    purpose_image_url VARCHAR(255) DEFAULT 'uploads/sustainability_research.png',
    cta_image_url VARCHAR(255) DEFAULT 'uploads/team_collaboration.png',
    contact_address VARCHAR(255) NOT NULL,
    contact_location VARCHAR(255) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Objetivos específicos del grupo de investigación
CREATE TABLE IF NOT EXISTS specific_objectives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    settings_id INT NOT NULL,
    objective TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    FOREIGN KEY (settings_id) REFERENCES site_settings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Líneas de investigación del grupo
CREATE TABLE IF NOT EXISTS research_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    settings_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'bi-gear', -- Nombre del icono de Bootstrap Icons
    `lines` TEXT NULL,                  -- Líneas específicas asociadas (separadas por comas)
    order_index INT NOT NULL DEFAULT 0,
    FOREIGN KEY (settings_id) REFERENCES site_settings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Investigadores (Equipo de trabajo)
CREATE TABLE IF NOT EXISTS researchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    names VARCHAR(150) NOT NULL,
    orcid_link VARCHAR(255) NULL,
    facebook_link VARCHAR(255) NULL,
    linkedin_link VARCHAR(255) NULL,
    instagram_link VARCHAR(255) NULL,
    telegram_link VARCHAR(255) NULL,
    institutional_email VARCHAR(150) UNIQUE NOT NULL,
    bio TEXT NOT NULL,
    position VARCHAR(100) NOT NULL, -- Ej: Director, Investigador Principal, Co-investigador
    photo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Proyectos de investigación
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    objectives TEXT NOT NULL,
    results TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    research_line_id INT NULL,      -- Eje/Línea de estudio asociado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (research_line_id) REFERENCES research_lines(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Tabla Intermedia: project_researchers (Muchos a Muchos entre Proyectos e Investigadores)
CREATE TABLE IF NOT EXISTS project_researchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    researcher_id INT NOT NULL,
    role_in_project VARCHAR(100) DEFAULT 'Investigador',
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (researcher_id) REFERENCES researchers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_researcher (project_id, researcher_id)
) ENGINE=InnoDB;

-- 7. Publicaciones Científicas (Artículos)
CREATE TABLE IF NOT EXISTS publications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    abstract TEXT NOT NULL,
    citation TEXT NOT NULL,
    journal_cover_url VARCHAR(255) NULL,
    doi_link VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Tabla Intermedia: publication_authors (Muchos a Muchos entre Publicaciones e Investigadores)
CREATE TABLE IF NOT EXISTS publication_authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publication_id INT NOT NULL,
    researcher_id INT NOT NULL,
    author_order INT NOT NULL DEFAULT 1,
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
    FOREIGN KEY (researcher_id) REFERENCES researchers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pub_author (publication_id, researcher_id)
) ENGINE=InnoDB;

-- 9. Buzón del formulario de contacto
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    names VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread', -- unread, read, replied
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Usuarios Administradores del Portal (Acceso privado)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 11. Diapositivas del Carrusel del Hero (Administrables)
CREATE TABLE IF NOT EXISTS hero_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NULL,
    subtitle VARCHAR(255) NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================================
-- DATOS INICIALES (SEMILLAS / SEEDS)
-- =========================================================================

-- Inserción inicial de configuración de REASONS
INSERT INTO site_settings (id, logo_url, purpose_image_url, cta_image_url, group_name, institution, description, objective_general, mission, vision, primary_color, secondary_color, accent_color, contact_address, contact_location, contact_email)
VALUES (
    1, 
    'uploads/logo_reasons.png', 
    'uploads/sustainability_research.png',
    'uploads/team_collaboration.png',
    'REASONS', 
    'Universidad Técnica de Ambato',
    'Grupo de investigación que impulsa soluciones innovadoras en ingeniería con un enfoque de sostenibilidad y compromiso social.',
    'Desarrollar investigación aplicada e interdisciplinaria en el campo de la ingeniería.',
    'Generar conocimiento científico y aplicado en el área de ingeniería mediante proyectos éticos de alto impacto, contribuyendo activamente al desarrollo sostenible y al bienestar de la sociedad.',
    'Ser reconocidos a nivel nacional e internacional como un grupo de investigación referente en sostenibilidad y tecnologías avanzadas de ingeniería para el año 2030.',
    '#0A5C36', -- Verde institucional UTA
    '#F4A261', -- Color secundario
    '#1D3557', -- Color de realce
    'Av. de Los Chasquis y Av. Río Payamino. Facultad de Ingeniería en Sistemas, Electrónica e Industrial.',
    'Universidad Técnica de Ambato. Ambato – Ecuador.',
    'reasons@uta.edu.ec'
) ON DUPLICATE KEY UPDATE id=id;

-- Inserción inicial de Objetivos Específicos
INSERT INTO specific_objectives (id, settings_id, objective, order_index) VALUES 
(1, 1, 'Diseñar y optimizar procesos en ingeniería con criterios de sostenibilidad.', 1),
(2, 1, 'Generar proyectos de investigación científica orientados a resolver problemáticas regionales y globales.', 2),
(3, 1, 'Formar profesionales e investigadores con una visión ética, ambiental y social sólida.', 3)
ON DUPLICATE KEY UPDATE id=id;

-- Inserción inicial de las 3 Líneas de Investigación descritas
INSERT INTO research_lines (id, settings_id, title, description, icon, `lines`, order_index) VALUES 
(1, 1, 'Diseño, Materiales, Producción, Identidad, Sostenibilidad y Tecnologías aplicadas', 'Enfoque en la creación de productos ecológicos, análisis del ciclo de vida, optimización de materiales e innovaciones en procesos productivos industriales.', 'bi-palette', 'Diseño de productos ecológicos, Análisis de ciclo de vida, Optimización de materiales, Innovaciones en procesos industriales', 1),
(2, 1, 'Software, Tecnologías de la Información y Ciencias de Datos', 'Desarrollo de sistemas de información inteligentes, análisis predictivos usando Big Data, soluciones móviles y automatización aplicada a la resolución de problemas científicos y sociales.', 'bi-code-slash', 'Sistemas de información inteligentes, Big Data y analítica predictiva, Desarrollo de aplicaciones móviles y web, Automatización científica', 2),
(3, 1, 'Energía, Desarrollo Sostenible y Gestión de Recursos Naturales', 'Estudio de energías renovables, mitigación de la huella de carbono, optimización del recurso hídrico y conservación ambiental a través de la ingeniería.', 'bi-globe-americas', 'Energías renovables y limpias, Mitigación de huella de carbono, Optimización de recursos hídricos, Conservación ambiental', 3)
ON DUPLICATE KEY UPDATE id=id;

-- Inserción de un usuario de administración semilla por defecto (Usuario: admin, Contraseña: AdminReasons2026!)
-- Contraseña encriptada usando bcrypt con factor de coste de 12
INSERT INTO users (id, username, password_hash, role) 
VALUES (1, 'admin', '$2b$12$N9qo8uLOqp02Y9EP3uqhbeBf3.Y2nN8hT2rC/F7Wn3W39U8jR/P/a', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Inserción inicial de Diapositivas Semilla para el Carrusel del Hero
INSERT INTO hero_slides (id, image_url, title, subtitle, order_index) VALUES
(1, 'uploads/hero_reasons.png', 'Investigación Científica con Impacto Real', 'Desarrollamos soluciones tecnológicas aplicadas para resolver los desafíos más exigentes de la industria moderna.', 1),
(2, 'uploads/sustainability_research.png', 'Compromiso con el Desarrollo Sostenible', 'Promovemos proyectos que cuidan el medio ambiente, optimizan los recursos hídricos y potencian las energías limpias.', 2),
(3, 'uploads/team_collaboration.png', 'Trabajo Colaborativo e Interdisciplinario', 'Impulsamos la sinergia científica uniendo investigadores altamente calificados para crear un futuro sostenible.', 3)
ON DUPLICATE KEY UPDATE id=id;

