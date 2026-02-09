-- ============================================
-- Migración: Tabla de Fotos para Bienes
-- Fecha: 2026-02-08
-- Descripción: Crea tabla para almacenar fotos asociadas a bienes
-- ============================================

CREATE TABLE fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_bien INT NOT NULL COMMENT 'FK al bien',
    nombre_archivo VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo en el servidor',
    ruta_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta completa del archivo',
    tamano_bytes INT NOT NULL COMMENT 'Tamaño del archivo en bytes',
    tipo_mime VARCHAR(100) NOT NULL COMMENT 'Tipo MIME (image/jpeg, image/png)',
    es_principal BOOLEAN DEFAULT FALSE COMMENT 'Si es la foto principal del bien',
    descripcion TEXT COMMENT 'Descripción opcional de la foto',
    uploaded_by INT COMMENT 'Usuario que subió la foto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_bien (id_bien),
    INDEX idx_principal (es_principal),
    INDEX idx_created (created_at)
) ENGINE=InnoDB COMMENT='Fotos asociadas a bienes';

-- Asegurar que solo haya una foto principal por bien
CREATE UNIQUE INDEX idx_bien_principal ON fotos (id_bien, es_principal) 
WHERE es_principal = TRUE;
