-- ============================================
-- Datos iniciales para el sistema (VERSIÓN CORREGIDA)
-- ============================================

USE bienes_salvador_allende;

-- ============================================
-- Usuario administrador por defecto
-- Password: admin123 (debe cambiarse en producción)
-- Hash bcrypt generado para 'admin123'
-- ============================================
INSERT INTO users (username, password, nombre_completo, email, role) VALUES
('admin', '$2a$12$UXrNnNwQ9.sM2pISWbW7Ju8o4cyPBZj03aDirOQt.P1aiZXg4lZsm', 'Administrador del Sistema', 'admin@salvadorallende.gob.ve', 'ADMIN'),
('usuario1', '$2a$12$UXrNnNwQ9.sM2pISWbW7Ju8o4cyPBZj03aDirOQt.P1aiZXg4lZsm', 'Usuario Estándar', 'usuario@salvadorallende.gob.ve', 'USER');

-- ============================================
-- Ubicaciones del ambulatorio
-- ============================================
INSERT INTO ubicaciones (nombre, descripcion, responsable) VALUES
('Dirección General', 'Oficina de la dirección del ambulatorio', 'Dr. Director General'),
('Departamento de Bienes', 'Área de gestión de bienes institucionales', 'Lic. Responsable de Bienes'),
('Emergencias', 'Área de atención de emergencias', 'Dr. Jefe de Emergencias'),
('Consultas Externas', 'Área de consultas ambulatorias', 'Dra. Jefa de Consultas'),
('Laboratorio', 'Laboratorio clínico', 'Bioanalista Responsable'),
('Rayos X', 'Departamento de imagenología', 'Técnico Radiólogo'),
('Farmacia', 'Farmacia institucional', 'Farmacéutico Responsable'),
('Almacén General', 'Almacén de suministros', 'Encargado de Almacén'),
('Mantenimiento', 'Departamento de mantenimiento', 'Jefe de Mantenimiento'),
('Administración', 'Área administrativa', 'Administrador General');

-- ============================================
-- Responsables de bienes
-- ============================================
INSERT INTO responsables (cedula, nombres, apellidos, telefono, email, departamento_id, cargo, acepta_responsabilidad, fecha_aceptacion) VALUES
('V-12345678', 'Carlos', 'Rodríguez', '0414-1234567', 'carlos.rodriguez@salvadorallende.gob.ve', 3, 'Jefe de Emergencias', TRUE, NOW()),
('V-23456789', 'María', 'González', '0424-2345678', 'maria.gonzalez@salvadorallende.gob.ve', 10, 'Administrador General', TRUE, NOW()),
('V-34567890', 'José', 'Pérez', '0412-3456789', 'jose.perez@salvadorallende.gob.ve', 5, 'Bioanalista Jefe', TRUE, NOW()),
('V-45678901', 'Ana', 'Martínez', '0416-4567890', 'ana.martinez@salvadorallende.gob.ve', 4, 'Médico Internista', TRUE, NOW()),
('V-56789012', 'Luis', 'Hernández', '0426-5678901', 'luis.hernandez@salvadorallende.gob.ve', 6, 'Técnico Radiólogo', TRUE, NOW()),
('V-67890123', 'Carmen', 'López', '0414-6789012', 'carmen.lopez@salvadorallende.gob.ve', 7, 'Farmacéutico', TRUE, NOW()),
('V-78901234', 'Pedro', 'Ramírez', '0424-7890123', 'pedro.ramirez@salvadorallende.gob.ve', 9, 'Jefe de Mantenimiento', TRUE, NOW()),
('V-89012345', 'Laura', 'Torres', '0412-8901234', 'laura.torres@salvadorallende.gob.ve', 2, 'Asistente de Bienes', TRUE, NOW());

-- ============================================
-- Categorías SUDEBIP - Nivel 1: Categorías Generales
-- ============================================
INSERT INTO categorias_sudebip (codigo, nivel, descripcion, categoria_padre_id) VALUES
('14000-0000', 'GENERAL', 'Equipos médicos y de laboratorio', NULL),
('15000-0000', 'GENERAL', 'Equipos de transporte, tracción y elevación', NULL),
('16000-0000', 'GENERAL', 'Equipos de computación', NULL),
('17000-0000', 'GENERAL', 'Maquinaria y equipos diversos', NULL),
('31000-0000', 'GENERAL', 'Mobiliario y equipos de oficina', NULL);

-- ============================================
-- Categorías SUDEBIP - Nivel 2: Subcategorías
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
-- Categorías SUDEBIP - Nivel 3: Categorías Específicas
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
-- Bienes de ejemplo
-- ============================================
INSERT INTO bienes (
    codigo_sudebip, 
    codigo_interno, 
    codigo_barras,
    descripcion, 
    marca, 
    modelo, 
    serial,
    fecha_adquisicion,
    estado,
    condicion,
    ubicacion_id,
    responsable_id,
    categoria_sudebip_id,
    tipo_origen,
    tiempo_registro,
    created_by
) VALUES
-- Ambulancia
(
    '15010-0001',
    'SA-AMB-001',
    'SA-AMB-001',
    'Ambulancia tipo II equipada',
    'Toyota',
    'Hiace 2020',
    'ABC123456',
    '2020-03-15',
    'ACTIVO',
    'EXCELENTE',
    3,
    1,
    19,
    'COMPRA',
    120,
    1
),
-- Computadora
(
    '16010-0001',
    'SA-PC-001',
    'SA-PC-001',
    'Computadora de escritorio para administración',
    'HP',
    'ProDesk 400 G6',
    'PC789456',
    '2021-06-10',
    'ACTIVO',
    'BUENO',
    10,
    2,
    21,
    'COMPRA',
    180,
    1
),
-- Electrocardiógrafo
(
    '14010-0003',
    'SA-ECG-001',
    'SA-ECG-001',
    'Electrocardiógrafo digital de 12 derivaciones',
    'Philips',
    'PageWriter TC70',
    'ECG456789',
    '2019-11-20',
    'ACTIVO',
    'BUENO',
    3,
    1,
    16,
    'DONACION',
    200,
    1
),
-- Microscopio
(
    '14020-0001',
    'SA-MIC-001',
    'SA-MIC-001',
    'Microscopio binocular',
    'Olympus',
    'CX23',
    'MIC123456',
    '2020-08-05',
    'ACTIVO',
    'EXCELENTE',
    5,
    3,
    18,
    'PRESTAMO_FUNDASALUD',
    150,
    1
),
-- Impresora
(
    '16020-0001',
    'SA-IMP-001',
    'SA-IMP-001',
    'Impresora multifuncional láser',
    'Canon',
    'imageRUNNER 2206N',
    'IMP789012',
    '2021-02-20',
    'ACTIVO',
    'BUENO',
    10,
    2,
    24,
    'COMPRA',
    90,
    1
);

-- ============================================
-- Notas importantes
-- ============================================
-- Los códigos de barras se generarán automáticamente en la aplicación
-- Las contraseñas deben cambiarse en producción
-- Este es un conjunto de datos mínimo para iniciar el sistema
