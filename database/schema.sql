-- ============================================
-- Sistema de Gestión de Bienes - Salvador Allende
-- Esquema de Base de Datos MySQL
-- Cumplimiento: Manual SUDEBIP 2014
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS bienes_salvador_allende
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bienes_salvador_allende;

-- ============================================
-- TABLA: users
-- Descripción: Usuarios del sistema con roles
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB COMMENT='Usuarios del sistema';

-- ============================================
-- TABLA: categorias_sudebip
-- Descripción: Catálogo jerárquico SUDEBIP
-- ============================================
CREATE TABLE categorias_sudebip (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE COMMENT 'Formato: XXXX-XXXX (10 caracteres)',
    nivel ENUM('GENERAL', 'SUBCATEGORIA', 'ESPECIFICA') NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    categoria_padre_id INT NULL COMMENT 'Referencia a categoría superior',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_padre_id) REFERENCES categorias_sudebip(id) ON DELETE SET NULL,
    INDEX idx_codigo (codigo),
    INDEX idx_nivel (nivel),
    INDEX idx_padre (categoria_padre_id)
) ENGINE=InnoDB COMMENT='Catálogo de clasificación SUDEBIP';

-- ============================================
-- TABLA: ubicaciones
-- Descripción: Departamentos y ubicaciones del ambulatorio
-- ============================================
CREATE TABLE ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    responsable VARCHAR(150),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB COMMENT='Ubicaciones y departamentos del ambulatorio';

-- ============================================
-- TABLA: responsables
-- Descripción: Personas responsables de bienes (no usuarios del sistema)
-- ============================================
CREATE TABLE responsables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de cédula de identidad',
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    departamento_id INT NOT NULL COMMENT 'Departamento donde trabaja',
    cargo VARCHAR(100),
    firma_digital LONGTEXT COMMENT 'Firma digital en base64 (imagen)',
    fecha_aceptacion TIMESTAMP NULL COMMENT 'Fecha de aceptación de responsabilidad',
    acepta_responsabilidad BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES ubicaciones(id),
    INDEX idx_cedula (cedula),
    INDEX idx_nombres (nombres, apellidos),
    INDEX idx_departamento (departamento_id),
    INDEX idx_activo (activo)
) ENGINE=InnoDB COMMENT='Responsables de bienes institucionales';

-- ============================================
-- TABLA: bienes
-- Descripción: Inventario de bienes institucionales
-- ============================================
CREATE TABLE bienes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_sudebip VARCHAR(10) NOT NULL COMMENT 'Código de clasificación SUDEBIP',
    codigo_interno VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único interno del bien',
    codigo_barras VARCHAR(100) UNIQUE COMMENT 'Código de barras Code128',
    descripcion TEXT NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serial VARCHAR(100),
    fecha_adquisicion DATE,
    estado ENUM('ACTIVO', 'INACTIVO', 'EN_REPARACION', 'DESINCORPORADO') NOT NULL DEFAULT 'ACTIVO',
    condicion ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'MALO', 'OBSOLETO') DEFAULT 'BUENO',
    ubicacion_id INT NOT NULL,
    responsable_id INT NOT NULL COMMENT 'Responsable actual del bien',
    observaciones TEXT,
    categoria_sudebip_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
    FOREIGN KEY (responsable_id) REFERENCES responsables(id),
    FOREIGN KEY (categoria_sudebip_id) REFERENCES categorias_sudebip(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_codigo_interno (codigo_interno),
    INDEX idx_codigo_sudebip (codigo_sudebip),
    INDEX idx_codigo_barras (codigo_barras),
    INDEX idx_estado (estado),
    INDEX idx_ubicacion (ubicacion_id),
    INDEX idx_categoria (categoria_sudebip_id)
) ENGINE=InnoDB COMMENT='Inventario de bienes institucionales';

-- ============================================
-- TABLA: transferencias
-- Descripción: Movimientos internos de bienes
-- ============================================
CREATE TABLE transferencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bien_id INT NOT NULL,
    ubicacion_origen_id INT NOT NULL,
    ubicacion_destino_id INT NOT NULL,
    responsable_origen_id INT NOT NULL,
    responsable_destino_id INT NOT NULL,
    motivo TEXT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL,
    fecha_ejecucion TIMESTAMP NULL,
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EJECUTADA') NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    solicitado_por INT NOT NULL,
    aprobado_por INT NULL,
    FOREIGN KEY (bien_id) REFERENCES bienes(id),
    FOREIGN KEY (ubicacion_origen_id) REFERENCES ubicaciones(id),
    FOREIGN KEY (ubicacion_destino_id) REFERENCES ubicaciones(id),
    FOREIGN KEY (responsable_origen_id) REFERENCES responsables(id),
    FOREIGN KEY (responsable_destino_id) REFERENCES responsables(id),
    FOREIGN KEY (solicitado_por) REFERENCES users(id),
    FOREIGN KEY (aprobado_por) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bien (bien_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_solicitud (fecha_solicitud),
    INDEX idx_ubicacion_origen (ubicacion_origen_id),
    INDEX idx_ubicacion_destino (ubicacion_destino_id)
) ENGINE=InnoDB COMMENT='Transferencias internas de bienes';

-- ============================================
-- TABLA: desincorporaciones
-- Descripción: Registro de bajas de bienes
-- ============================================
CREATE TABLE desincorporaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bien_id INT NOT NULL,
    motivo ENUM('PERDIDA', 'DAÑO', 'OBSOLESCENCIA', 'DONACION', 'OTRO') NOT NULL,
    descripcion_motivo TEXT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL,
    fecha_ejecucion TIMESTAMP NULL,
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EJECUTADA') NOT NULL DEFAULT 'PENDIENTE',
    valor_residual DECIMAL(15,2) DEFAULT 0.00,
    documento_respaldo VARCHAR(255) COMMENT 'Ruta del documento de respaldo',
    observaciones TEXT,
    solicitado_por INT NOT NULL,
    aprobado_por INT NULL,
    FOREIGN KEY (bien_id) REFERENCES bienes(id),
    FOREIGN KEY (solicitado_por) REFERENCES users(id),
    FOREIGN KEY (aprobado_por) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bien (bien_id),
    INDEX idx_estado (estado),
    INDEX idx_motivo (motivo),
    INDEX idx_fecha_solicitud (fecha_solicitud)
) ENGINE=InnoDB COMMENT='Desincorporaciones de bienes';

-- ============================================
-- TABLA: logs_auditoria
-- Descripción: Registro de todas las operaciones
-- ============================================
CREATE TABLE logs_auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    accion VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc.',
    entidad VARCHAR(50) NOT NULL COMMENT 'Tabla afectada',
    entidad_id INT COMMENT 'ID del registro afectado',
    detalles JSON COMMENT 'Información adicional de la operación',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_accion (accion),
    INDEX idx_entidad (entidad),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB COMMENT='Auditoría de operaciones del sistema';

-- ============================================
-- TABLA: alertas
-- Descripción: Alertas del sistema
-- ============================================
CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('INVENTARIO_VENCIDO', 'SIN_TRAZABILIDAD', 'AUDITORIA_PROXIMA', 'OTRO') NOT NULL,
    severidad ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA') NOT NULL DEFAULT 'MEDIA',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    bien_id INT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    FOREIGN KEY (bien_id) REFERENCES bienes(id) ON DELETE CASCADE,
    INDEX idx_tipo (tipo),
    INDEX idx_severidad (severidad),
    INDEX idx_leida (leida),
    INDEX idx_bien (bien_id)
) ENGINE=InnoDB COMMENT='Alertas y notificaciones del sistema';

-- ============================================
-- TABLA: mantenimientos
-- Descripción: Historial de mantenimientos de bienes
-- ============================================
CREATE TABLE mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bien_id INT NOT NULL,
    tipo ENUM('PREVENTIVO', 'CORRECTIVO', 'CALIBRACION', 'OTRO') NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_programada DATE,
    fecha_realizada DATE,
    costo DECIMAL(15,2),
    proveedor VARCHAR(150),
    observaciones TEXT,
    realizado_por VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bien_id) REFERENCES bienes(id) ON DELETE CASCADE,
    INDEX idx_bien (bien_id),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha_programada (fecha_programada)
) ENGINE=InnoDB COMMENT='Historial de mantenimientos';

-- ============================================
-- TABLA: fotos
-- Descripción: Fotos de bienes para documentación visual
-- ============================================
CREATE TABLE fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bien_id INT NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL COMMENT 'Ruta del archivo en el servidor',
    nombre_original VARCHAR(255) NOT NULL,
    tipo_proceso ENUM('REGISTRO', 'TRANSFERENCIA', 'DESINCORPORACION', 'MANTENIMIENTO', 'OTRO') NOT NULL,
    proceso_id INT NULL COMMENT 'ID del proceso relacionado (transferencia_id, desincorporacion_id, etc)',
    descripcion TEXT COMMENT 'Descripción de la foto',
    tamano_bytes INT,
    mime_type VARCHAR(50),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bien_id) REFERENCES bienes(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bien (bien_id),
    INDEX idx_tipo_proceso (tipo_proceso),
    INDEX idx_proceso (proceso_id)
) ENGINE=InnoDB COMMENT='Fotos de bienes para documentación';
