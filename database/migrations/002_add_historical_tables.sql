-- ============================================
-- Migración: Tablas Históricas para Relaciones Muchos-a-Muchos
-- Fecha: 2026-02-08
-- Descripción: Crea tablas intermedias para rastrear el historial completo
--              de responsables y usuarios que han gestionado cada bien
-- ============================================

-- ============================================
-- TABLA: bienes_responsables_historico
-- Descripción: Historial de todos los responsables asignados a cada bien
-- ============================================
CREATE TABLE bienes_responsables_historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_bien INT NOT NULL COMMENT 'FK al bien',
    id_responsable INT NOT NULL COMMENT 'FK al responsable asignado',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Cuándo se asignó',
    fecha_fin TIMESTAMP NULL COMMENT 'Cuándo dejó de ser responsable (NULL = actual)',
    motivo_asignacion TEXT COMMENT 'Razón de la asignación',
    asignado_por INT COMMENT 'Usuario que realizó la asignación',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Si es la asignación actual',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien) ON DELETE CASCADE,
    FOREIGN KEY (id_responsable) REFERENCES responsables(id_responsable),
    FOREIGN KEY (asignado_por) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_bien (id_bien),
    INDEX idx_responsable (id_responsable),
    INDEX idx_activo (activo),
    INDEX idx_fecha_asignacion (fecha_asignacion)
) ENGINE=InnoDB COMMENT='Historial de responsables por bien';

-- ============================================
-- TABLA: bienes_usuarios_historico
-- Descripción: Historial de usuarios que han gestionado/modificado cada bien
-- ============================================
CREATE TABLE bienes_usuarios_historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_bien INT NOT NULL COMMENT 'FK al bien',
    id_usuario INT NOT NULL COMMENT 'FK al usuario que realizó la acción',
    accion ENUM('CREACION', 'MODIFICACION', 'TRANSFERENCIA', 'DESINCORPORACION', 'ASIGNACION', 'MANTENIMIENTO') NOT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles JSON COMMENT 'Información adicional sobre la acción realizada',
    ip_address VARCHAR(45) COMMENT 'IP desde donde se realizó la acción',
    
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_bien (id_bien),
    INDEX idx_usuario (id_usuario),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha_accion)
) ENGINE=InnoDB COMMENT='Historial de usuarios que gestionaron cada bien';

-- ============================================
-- Migración de datos existentes
-- ============================================

-- Migrar responsables actuales al historial
INSERT INTO bienes_responsables_historico 
    (id_bien, id_responsable, fecha_asignacion, motivo_asignacion, asignado_por, activo)
SELECT 
    id_bien,
    id_responsable_uso,
    created_at,
    'Migración de datos existentes - Responsable inicial',
    created_by,
    TRUE
FROM bienes
WHERE id_responsable_uso IS NOT NULL;

-- Migrar creadores de bienes al historial de usuarios
INSERT INTO bienes_usuarios_historico
    (id_bien, id_usuario, accion, fecha_accion, detalles)
SELECT 
    id_bien,
    created_by,
    'CREACION',
    created_at,
    JSON_OBJECT(
        'descripcion', descripcion,
        'codigo_interno', codigo_interno,
        'estatus_inicial', estatus_uso
    )
FROM bienes
WHERE created_by IS NOT NULL;

-- ============================================
-- Verificación de integridad
-- ============================================

-- Verificar que todos los bienes tengan al menos un registro en historial de responsables
SELECT 
    COUNT(DISTINCT b.id_bien) as total_bienes,
    COUNT(DISTINCT h.id_bien) as bienes_con_historial,
    COUNT(DISTINCT b.id_bien) - COUNT(DISTINCT h.id_bien) as bienes_sin_historial
FROM bienes b
LEFT JOIN bienes_responsables_historico h ON b.id_bien = h.id_bien;

-- Verificar que todos los bienes tengan al menos un registro en historial de usuarios
SELECT 
    COUNT(DISTINCT b.id_bien) as total_bienes,
    COUNT(DISTINCT h.id_bien) as bienes_con_historial_usuarios,
    COUNT(DISTINCT b.id_bien) - COUNT(DISTINCT h.id_bien) as bienes_sin_historial_usuarios
FROM bienes b
LEFT JOIN bienes_usuarios_historico h ON b.id_bien = h.id_bien;
