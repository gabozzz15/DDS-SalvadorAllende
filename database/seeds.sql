-- ============================================
-- Seeds para Base de Datos Normalizada SUDEBIP
-- Sistema de Gestión de Bienes - Salvador Allende
-- ============================================

USE bienes_salvador_allende;

-- Deshabilitar verificación de llaves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas existentes
TRUNCATE TABLE fotos;
TRUNCATE TABLE mantenimientos;
TRUNCATE TABLE alertas;
TRUNCATE TABLE logs_auditoria;
TRUNCATE TABLE desincorporaciones;
TRUNCATE TABLE transferencias;
TRUNCATE TABLE bienes;
TRUNCATE TABLE responsables;
TRUNCATE TABLE unidades_administrativas;
TRUNCATE TABLE categorias_sudebip;
TRUNCATE TABLE tipos_origen;
TRUNCATE TABLE users;

-- Rehabilitar verificación de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- USUARIOS DEL SISTEMA
-- ============================================
INSERT INTO users (username, password, nombre_completo, email, role, activo) VALUES
('admin', '$2a$12$FMhrmDQhiCT3KazdJj4plO6kT7zfuM70PKYU9SdwRtfefWKel7S36', 'Administrador del Sistema', 'admin@salvadorallende.gob.ve', 'ADMIN', TRUE),
('usuario1', '$2a$12$FMhrmDQhiCT3KazdJj4plO6kT7zfuM70PKYU9SdwRtfefWKel7S36', 'María González', 'mgonzalez@salvadorallende.gob.ve', 'USER', TRUE),
('usuario2', '$2a$12$FMhrmDQhiCT3KazdJj4plO6kT7zfuM70PKYU9SdwRtfefWKel7S36', 'Carlos Pérez', 'cperez@salvadorallende.gob.ve', 'USER', TRUE);

-- ============================================
-- TIPOS DE ORIGEN
-- ============================================
INSERT INTO tipos_origen (nombre) VALUES
('COMPRA'),
('DONACION'),
('PRESTAMO_FUNDASALUD');

-- ============================================
-- CATEGORÍAS SUDEBIP - Nivel 1: Categorías Generales
-- ============================================
INSERT INTO categorias_sudebip (codigo, nivel, descripcion, categoria_padre_id) VALUES
('14000-0000', 'GENERAL', 'Equipos médicos y de laboratorio', NULL),
('15000-0000', 'GENERAL', 'Equipos de transporte, tracción y elevación', NULL),
('16000-0000', 'GENERAL', 'Equipos de computación', NULL),
('17000-0000', 'GENERAL', 'Maquinaria y equipos diversos', NULL),
('31000-0000', 'GENERAL', 'Mobiliario y equipos de oficina', NULL);

-- ============================================
-- CATEGORÍAS SUDEBIP - Nivel 2: Subcategorías
-- ============================================
INSERT INTO categorias_sudebip (codigo, nivel, descripcion, categoria_padre_id) VALUES
('14010-0000', 'SUBCATEGORIA', 'Equipos médicos quirúrgicos', 1),
('14020-0000', 'SUBCATEGORIA', 'Equipos de laboratorio', 1),
('14030-0000', 'SUBCATEGORIA', 'Equipos de diagnóstico', 1),
('15010-0000', 'SUBCATEGORIA', 'Vehículos automotores terrestres', 2),
('16010-0000', 'SUBCATEGORIA', 'Equipos de procesamiento de datos', 3),
('16020-0000', 'SUBCATEGORIA', 'Equipos periféricos', 3),
('31010-0000', 'SUBCATEGORIA', 'Mobiliario de oficina', 5),
('31020-0000', 'SUBCATEGORIA', 'Mobiliario médico', 5);

-- ============================================
-- CATEGORÍAS SUDEBIP - Nivel 3: Categorías Específicas
-- ============================================
INSERT INTO categorias_sudebip (codigo, nivel, descripcion, categoria_padre_id) VALUES
('14010-0001', 'ESPECIFICA', 'Camillas', 6),
('14010-0002', 'ESPECIFICA', 'Desfibriladores', 6),
('14010-0003', 'ESPECIFICA', 'Electrocardiógrafos', 6),
('14010-0004', 'ESPECIFICA', 'Tensiómetros', 6),
('14020-0001', 'ESPECIFICA', 'Microscopios', 7),
('14020-0002', 'ESPECIFICA', 'Centrífugas', 7),
('14020-0003', 'ESPECIFICA', 'Analizadores hematológicos', 7),
('14030-0001', 'ESPECIFICA', 'Equipos de rayos X', 8),
('14030-0002', 'ESPECIFICA', 'Ecógrafos', 8),
('15010-0001', 'ESPECIFICA', 'Ambulancias', 9),
('15010-0002', 'ESPECIFICA', 'Vehículos administrativos', 9),
('16010-0001', 'ESPECIFICA', 'Computadoras de escritorio', 10),
('16010-0002', 'ESPECIFICA', 'Computadoras portátiles', 10),
('16010-0003', 'ESPECIFICA', 'Servidores', 10),
('16020-0001', 'ESPECIFICA', 'Impresoras', 11),
('16020-0002', 'ESPECIFICA', 'Escáneres', 11),
('31010-0001', 'ESPECIFICA', 'Escritorios', 12),
('31010-0002', 'ESPECIFICA', 'Sillas de oficina', 12),
('31010-0003', 'ESPECIFICA', 'Archivadores', 12),
('31020-0001', 'ESPECIFICA', 'Camillas médicas', 13),
('31020-0002', 'ESPECIFICA', 'Mesas de exploración', 13);

-- ============================================
-- UNIDADES ADMINISTRATIVAS
-- ============================================
INSERT INTO unidades_administrativas (codigo_unidad_sudebip, nombre, descripcion, responsable_unidad) VALUES
('UA-001', 'Dirección General', 'Dirección administrativa del ambulatorio', 'Dr. Juan Pérez'),
('UA-002', 'Consulta Externa', 'Área de consultas médicas', 'Dra. Ana Martínez'),
('UA-003', 'Emergencias', 'Servicio de emergencias 24/7', 'Dr. Carlos Rodríguez'),
('UA-004', 'Laboratorio', 'Laboratorio clínico', 'Bioanalista María López'),
('UA-005', 'Radiología', 'Servicio de radiología e imágenes', 'Técnico Pedro Sánchez'),
('UA-006', 'Farmacia', 'Farmacia del ambulatorio', 'Farmacéutica Laura Díaz'),
('UA-007', 'Administración', 'Departamento administrativo', 'Lic. Roberto Gómez'),
('UA-008', 'Mantenimiento', 'Departamento de mantenimiento', 'Ing. José Hernández'),
('UA-009', 'Bienes', 'Departamento de bienes', 'Lic. Martha Trejo');
;

-- ============================================
-- RESPONSABLES
-- ============================================
INSERT INTO responsables (cedula, nombres, apellidos, telefono, email, id_unidad_adscripcion, cargo, tipo_responsable_sudebip, acepta_responsabilidad) VALUES
('V-12345678', 'Juan', 'Pérez', '0212-1234567', 'jperez@salvadorallende.gob.ve', 1, 'Director', 'D', TRUE),
('V-23456789', 'Ana', 'Martínez', '0212-2345678', 'amartinez@salvadorallende.gob.ve', 2, 'Jefa de Consulta Externa', 'U', TRUE),
('V-34567890', 'Carlos', 'Rodríguez', '0212-3456789', 'crodriguez@salvadorallende.gob.ve', 3, 'Jefe de Emergencias', 'U', TRUE),
('V-45678901', 'María', 'López', '0212-4567890', 'mlopez@salvadorallende.gob.ve', 4, 'Bioanalista Jefe', 'U', TRUE),
('V-56789012', 'Pedro', 'Sánchez', '0212-5678901', 'psanchez@salvadorallende.gob.ve', 5, 'Técnico Radiólogo', 'U', TRUE),
('V-67890123', 'Laura', 'Díaz', '0212-6789012', 'ldiaz@salvadorallende.gob.ve', 6, 'Farmacéutica', 'C', TRUE),
('V-78901234', 'Roberto', 'Gómez', '0212-7890123', 'rgomez@salvadorallende.gob.ve', 7, 'Administrador', 'D', TRUE),
('V-89012345', 'José', 'Hernández', '0212-8901234', 'jhernandez@salvadorallende.gob.ve', 8, 'Jefe de Mantenimiento', 'C', TRUE);

-- ============================================
-- BIENES DE EJEMPLO
-- ============================================
INSERT INTO bienes (
    codigo_interno,
    descripcion,
    serial_bien,
    marca,
    modelo,
    id_categoria_especifica,
    id_unidad_administrativa,
    id_responsable_uso,
    id_tipo_origen,
    estatus_uso,
    condicion_fisica,
    fecha_adquisicion,
    fecha_ingreso,
    observacion,
    created_by
) VALUES
-- Equipos médicos
('SA-CAM-001', 'Camilla de emergencia con ruedas', 'CAM2023001', 'MedEquip', 'CE-500', 14, 3, 3, 1, 'ACTIVO', 'BUENO', '2023-01-15', '2023-01-20', 'Camilla para traslado de pacientes', 1),
('SA-DEF-001', 'Desfibrilador automático externo', 'DEF2023001', 'Philips', 'HeartStart', 15, 3, 3, 2, 'ACTIVO', 'EXCELENTE', '2023-02-10', '2023-02-15', 'Desfibrilador donado por fundación', 1),
('SA-ECG-001', 'Electrocardiógrafo portátil', 'ECG2023001', 'GE Healthcare', 'MAC 600', 16, 2, 2, 1, 'ACTIVO', 'BUENO', '2023-03-05', '2023-03-10', NULL, 1),
('SA-TEN-001', 'Tensiómetro digital', 'TEN2023001', 'Omron', 'HEM-7120', 17, 2, 2, 1, 'ACTIVO', 'BUENO', '2023-04-12', '2023-04-15', NULL, 1),

-- Equipos de laboratorio
('SA-MIC-001', 'Microscopio binocular', 'MIC2023001', 'Olympus', 'CX23', 18, 4, 4, 1, 'ACTIVO', 'EXCELENTE', '2023-05-20', '2023-05-25', NULL, 1),
('SA-CEN-001', 'Centrífuga de laboratorio', 'CEN2023001', 'Hettich', 'EBA 200', 19, 4, 4, 1, 'ACTIVO', 'BUENO', '2023-06-10', '2023-06-15', NULL, 1),

-- Equipos de transporte
('SA-AMB-001', 'Ambulancia tipo II', 'AMB2023001', 'Toyota', 'Hiace 2023', 23, 3, 3, 3, 'ACTIVO', 'EXCELENTE', '2023-07-01', '2023-07-05', 'Préstamo de Fundasalud', 1),

-- Equipos de computación
('SA-PC-001', 'Computadora de escritorio', 'PC2023001', 'HP', 'ProDesk 400', 25, 7, 7, 1, 'ACTIVO', 'BUENO', '2023-08-15', '2023-08-20', NULL, 1),
('SA-PC-002', 'Computadora de escritorio', 'PC2023002', 'HP', 'ProDesk 400', 25, 1, 1, 1, 'ACTIVO', 'BUENO', '2023-08-15', '2023-08-20', NULL, 1),
('SA-LAP-001', 'Laptop', 'LAP2023001', 'Dell', 'Latitude 3420', 26, 1, 1, 1, 'ACTIVO', 'EXCELENTE', '2023-09-10', '2023-09-15', NULL, 1),
('SA-IMP-001', 'Impresora multifuncional', 'IMP2023001', 'Canon', 'MF445dw', 28, 7, 7, 1, 'ACTIVO', 'BUENO', '2023-10-05', '2023-10-10', NULL, 1),

-- Mobiliario
('SA-ESC-001', 'Escritorio ejecutivo', 'ESC2023001', 'OfficeMax', 'EJ-200', 30, 1, 1, 1, 'ACTIVO', 'BUENO', '2023-11-01', '2023-11-05', NULL, 1),
('SA-SIL-001', 'Silla ergonómica', 'SIL2023001', 'Herman Miller', 'Aeron', 31, 1, 1, 2, 'ACTIVO', 'EXCELENTE', '2023-11-15', '2023-11-20', 'Donación empresarial', 1);

-- ============================================
-- ALERTAS DE EJEMPLO
-- ============================================
INSERT INTO alertas (tipo, severidad, titulo, descripcion, id_bien, leida) VALUES
('INVENTARIO_VENCIDO', 'MEDIA', 'Revisión de inventario pendiente', 'Se requiere revisión anual del inventario de bienes', NULL, FALSE),
('AUDITORIA_PROXIMA', 'ALTA', 'Auditoría programada', 'Auditoría de bienes programada para el próximo mes', NULL, FALSE);

-- Mensaje de finalización
SELECT 'Seeds cargados exitosamente' AS Status;
