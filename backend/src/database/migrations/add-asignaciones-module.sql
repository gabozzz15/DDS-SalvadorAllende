-- Migración: Crear tabla de asignaciones
-- Fecha: 2026-01-10
-- Descripción: Tabla para gestionar asignaciones de bienes nuevos desde Almacén

CREATE TABLE asignaciones (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_bien INT NOT NULL,
    ubicacion_destino_id INT NOT NULL,
    responsable_destino_id INT NOT NULL,
    motivo TEXT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT NOT NULL,
    observaciones TEXT,
    
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien) ON DELETE RESTRICT,
    FOREIGN KEY (ubicacion_destino_id) REFERENCES unidades_administrativas(id_unidad) ON DELETE RESTRICT,
    FOREIGN KEY (responsable_destino_id) REFERENCES responsables(id_responsable) ON DELETE RESTRICT,
    FOREIGN KEY (asignado_por) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_bien (id_bien),
    INDEX idx_ubicacion_destino (ubicacion_destino_id),
    INDEX idx_fecha (fecha_asignacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios
ALTER TABLE asignaciones 
COMMENT = 'Registro de asignaciones iniciales de bienes desde Almacén a departamentos';
