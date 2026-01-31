-- ============================================
-- Sistema de Gestión de Bienes - Salvador Allende
-- ESQUEMA NORMALIZADO siguiendo Manual SUDEBIP 2014
-- ============================================

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
-- Descripción: Catálogo jerárquico SUDEBIP (Anexo A)
-- ============================================
CREATE TABLE categorias_sudebip (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE COMMENT 'Formato: XXXXX-XXXX (Anexo A)',
    nivel ENUM('GENERAL', 'SUBCATEGORIA', 'ESPECIFICA') NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    categoria_padre_id INT NULL COMMENT 'FK a categoría superior',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_padre_id) REFERENCES categorias_sudebip(id_categoria) ON DELETE SET NULL,
    INDEX idx_codigo (codigo),
    INDEX idx_nivel (nivel),
    INDEX idx_padre (categoria_padre_id)
) ENGINE=InnoDB COMMENT='Catálogo de clasificación SUDEBIP (Anexo A)';

-- ============================================
-- TABLA: unidades_administrativas
-- Descripción: Unidades administrativas/ubicaciones (Anexo S.5)
-- ============================================
CREATE TABLE unidades_administrativas (
    id_unidad INT AUTO_INCREMENT PRIMARY KEY,
    codigo_unidad_sudebip VARCHAR(10) UNIQUE COMMENT 'Código interno de la Unidad (Anexo S.5 Nro 1)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Descripción de la Unidad (Anexo S.5 Nro 2)',
    descripcion TEXT,
    responsable_unidad VARCHAR(150),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_codigo_sudebip (codigo_unidad_sudebip),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB COMMENT='Unidades Administrativas / Ubicaciones (Anexo S.5)';

-- ============================================
-- TABLA: responsables
-- Descripción: Responsables de bienes (Anexo T.4)
-- ============================================
CREATE TABLE responsables (
    id_responsable INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE COMMENT 'Cédula de Identidad (Anexo T.4 Nro 3)',
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    id_unidad_adscripcion INT NOT NULL COMMENT 'Departamento donde trabaja (Anexo T.4 Nro 9)',
    cargo VARCHAR(100) COMMENT 'Cargo del Responsable (Anexo T.4 Nro 7)',
    tipo_responsable_sudebip ENUM('D', 'U', 'C') NOT NULL DEFAULT 'U' COMMENT 'D=Administrativo, U=Uso Directo, C=Cuido Directo (Anexo T.4 Nro 2)',
    firma_digital LONGTEXT COMMENT 'Firma digital en base64',
    fecha_aceptacion TIMESTAMP NULL COMMENT 'Fecha de aceptación de responsabilidad',
    acepta_responsabilidad BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_unidad_adscripcion) REFERENCES unidades_administrativas(id_unidad),
    INDEX idx_cedula (cedula),
    INDEX idx_nombres (nombres, apellidos),
    INDEX idx_unidad (id_unidad_adscripcion),
    INDEX idx_tipo (tipo_responsable_sudebip),
    INDEX idx_activo (activo)
) ENGINE=InnoDB COMMENT='Responsables de bienes institucionales (Anexo T.4)';

-- ============================================
-- TABLA: tipos_origen
-- Descripción: Catálogo de tipos de origen de adquisición
-- ============================================
CREATE TABLE tipos_origen (
    id_tipo_origen INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL COMMENT 'COMPRA, DONACION, PRESTAMO_FUNDASALUD'
) ENGINE=InnoDB COMMENT='Catálogo de origen de adquisición para KPI';

-- ============================================
-- TABLA: bienes
-- Descripción: Inventario de bienes institucionales (Anexos T.8, T.9, T.10)
-- ============================================
CREATE TABLE bienes (
    id_bien INT AUTO_INCREMENT PRIMARY KEY,
    codigo_interno VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único interno del bien (Anexo T.8 Nro 7)',
    codigo_barras VARCHAR(100) UNIQUE COMMENT 'Código de barras Code128',
    descripcion TEXT NOT NULL,
    serial_bien VARCHAR(100) COMMENT 'Serial del Bien (Anexo T.8 Nro 18)',
    marca VARCHAR(100),
    modelo VARCHAR(100),
    
    -- Relaciones (Llaves Foráneas)
    id_categoria_especifica INT NOT NULL COMMENT 'FK a categorias_sudebip (Anexo T.8 Nro 2)',
    id_unidad_administrativa INT NOT NULL COMMENT 'Ubicación/Departamento actual',
    id_responsable_uso INT NOT NULL COMMENT 'Responsable de Uso actual',
    id_tipo_origen INT NOT NULL COMMENT 'Tipo de origen de adquisición',
    
    -- Estatus / Fechas / Valores
    estatus_uso ENUM('ACTIVO', 'INACTIVO', 'EN_REPARACION', 'DESINCORPORADO') NOT NULL DEFAULT 'ACTIVO',
    condicion_fisica ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'MALO', 'OBSOLETO') DEFAULT 'BUENO' COMMENT 'Condición del Bien (Anexo L)',
    fecha_adquisicion DATE,
    fecha_ingreso DATE,
    
    -- KPI Fields
    fecha_inicio_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp inicio de registro (KPI)',
    fecha_finaliza_registro TIMESTAMP NULL COMMENT 'Timestamp fin del registro (KPI)',
    
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    
    FOREIGN KEY (id_unidad_administrativa) REFERENCES unidades_administrativas(id_unidad),
    FOREIGN KEY (id_responsable_uso) REFERENCES responsables(id_responsable),
    FOREIGN KEY (id_categoria_especifica) REFERENCES categorias_sudebip(id_categoria),
    FOREIGN KEY (id_tipo_origen) REFERENCES tipos_origen(id_tipo_origen),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_codigo_interno (codigo_interno),
    INDEX idx_codigo_barras (codigo_barras),
    INDEX idx_estatus (estatus_uso),
    INDEX idx_unidad (id_unidad_administrativa),
    INDEX idx_categoria (id_categoria_especifica)
) ENGINE=InnoDB COMMENT='Inventario de bienes institucionales (Anexos T.8, T.9, T.10)';

-- ============================================
-- TABLA: transferencias
-- Descripción: Movimientos internos de bienes
-- ============================================
CREATE TABLE transferencias (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_bien INT NOT NULL,
    ubicacion_origen_id INT NOT NULL,
    ubicacion_destino_id INT NOT NULL,
    responsable_origen_id INT NOT NULL,
    responsable_destino_id INT NOT NULL,
    motivo TEXT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL COMMENT 'KPI: Tiempo de aprobación',
    fecha_ejecucion TIMESTAMP NULL,
    estatus ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EJECUTADA') NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    solicitado_por INT NOT NULL,
    aprobado_por INT NULL,
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien),
    FOREIGN KEY (ubicacion_origen_id) REFERENCES unidades_administrativas(id_unidad),
    FOREIGN KEY (ubicacion_destino_id) REFERENCES unidades_administrativas(id_unidad),
    FOREIGN KEY (responsable_origen_id) REFERENCES responsables(id_responsable),
    FOREIGN KEY (responsable_destino_id) REFERENCES responsables(id_responsable),
    FOREIGN KEY (solicitado_por) REFERENCES users(id),
    FOREIGN KEY (aprobado_por) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bien (id_bien),
    INDEX idx_estatus (estatus),
    INDEX idx_fecha_solicitud (fecha_solicitud),
    INDEX idx_ubicacion_origen (ubicacion_origen_id),
    INDEX idx_ubicacion_destino (ubicacion_destino_id)
) ENGINE=InnoDB COMMENT='Transferencias internas de bienes';

-- ============================================
-- TABLA: desincorporaciones
-- Descripción: Registro de bajas de bienes
-- ============================================
CREATE TABLE desincorporaciones (
    id_desincorporacion INT AUTO_INCREMENT PRIMARY KEY,
    id_bien INT UNIQUE NOT NULL COMMENT 'Un bien solo puede tener una desincorporación final',
    motivo ENUM('PERDIDA', 'DAÑO', 'OBSOLESCENCIA', 'DONACION_BAJA', 'OTRO') NOT NULL,
    descripcion_motivo TEXT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL COMMENT 'KPI: Tiempo de aprobación',
    fecha_ejecucion TIMESTAMP NULL COMMENT 'Fecha de la baja física del inventario',
    estatus ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EJECUTADA') NOT NULL DEFAULT 'PENDIENTE',
    valor_residual DECIMAL(15,2) DEFAULT 0.00,
    documento_respaldo VARCHAR(255) COMMENT 'Ruta del documento de respaldo',
    observaciones TEXT,
    solicitado_por INT NOT NULL,
    aprobado_por INT NULL,
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien),
    FOREIGN KEY (solicitado_por) REFERENCES users(id),
    FOREIGN KEY (aprobado_por) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bien (id_bien),
    INDEX idx_estatus (estatus),
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
    id_bien INT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien) ON DELETE CASCADE,
    INDEX idx_tipo (tipo),
    INDEX idx_severidad (severidad),
    INDEX idx_leida (leida),
    INDEX idx_bien (id_bien)
) ENGINE=InnoDB COMMENT='Alertas y notificaciones del sistema';

-- ============================================
-- TABLA: mantenimientos
-- Descripción: Historial de mantenimientos de bienes
-- ============================================
CREATE TABLE mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_bien INT NOT NULL,
    tipo ENUM('PREVENTIVO', 'CORRECTIVO', 'CALIBRACION', 'OTRO') NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_programada DATE,
    fecha_realizada DATE,
    costo DECIMAL(15,2),
    proveedor VARCHAR(150),
    observaciones TEXT,
    realizado_por VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien) ON DELETE CASCADE,
    INDEX idx_bien (id_bien),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha_programada (fecha_programada)
) ENGINE=InnoDB COMMENT='Historial de mantenimientos';

-- ============================================
-- TABLA: fotos
-- Descripción: Fotos de bienes para documentación visual
-- ============================================
CREATE TABLE fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_bien INT NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL COMMENT 'Ruta del archivo en el servidor',
    nombre_original VARCHAR(255) NOT NULL,
    tipo_proceso ENUM('REGISTRO', 'TRANSFERENCIA', 'DESINCORPORACION', 'MANTENIMIENTO', 'OTRO') NOT NULL,
    proceso_id INT NULL COMMENT 'ID del proceso relacionado',
    descripcion TEXT COMMENT 'Descripción de la foto',
    tamano_bytes INT,
    mime_type VARCHAR(50),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bien (id_bien),
    INDEX idx_tipo_proceso (tipo_proceso),
    INDEX idx_proceso (proceso_id)
) ENGINE=InnoDB COMMENT='Fotos de bienes para documentación';
