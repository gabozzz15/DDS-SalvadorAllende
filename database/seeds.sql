-- ============================================
-- Datos iniciales para el sistema
-- ============================================

USE bienes_salvador_allende;

-- ============================================
-- Usuario administrador por defecto
-- Password: admin123 (debe cambiarse en producción)
-- Hash bcrypt generado para 'admin123'
-- ============================================
INSERT INTO users (username, password, nombre_completo, email, role) VALUES
('admin', '$2b$10$rGHvXYZ8kN5qF4pJ9mLXxeYQZ3K7wH8vN2jT6sR4pL9mK5nQ3xW2y', 'Administrador del Sistema', 'admin@salvadorallende.gob.ve', 'ADMIN'),
('usuario1', '$2b$10$rGHvXYZ8kN5qF4pJ9mLXxeYQZ3K7wH8vN2jT6sR4pL9mK5nQ3xW2y', 'Usuario Estándar', 'usuario@salvadorallende.gob.ve', 'USER');

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
('V-12345678', 'Carlos', 'Rodríguez', '0414-1234567', 'carlos.rodriguez@salvadorallende.gob.ve', 
    (SELECT id FROM ubicaciones WHERE nombre = 'Emergencias'), 'Jefe de Emergencias', TRUE, NOW()),
('V-23456789', 'María', 'González', '0424-2345678', 'maria.gonzalez@salvadorallende.gob.ve', 
    (SELECT id FROM ubicaciones WHERE nombre = 'Administración'), 'Administrador General', TRUE, NOW()),
('V-34567890', 'José', 'Pérez', '0412-3456789', 'jose.perez@salvadorallende.gob.ve', 
    (SELECT id FROM ubicaciones WHERE nombre = 'Laboratorio'), 'Bioanalista Jefe', TRUE, NOW()),
('V-45678901', 'Ana', 'Martínez', '0416-4567890', 'ana.martinez@salvadorallende.gob.ve', 
    (SELECT id FROM ubicaciones WHERE nombre = 'Consultas Externas'), 'Médico Internista', TRUE, NOW()),
('V-56789012', 'Luis', 'Hernández', '0426-5678901', 'luis.hernandez@salvadorallende.gob.ve', 
    (SELECT id FROM ubicaciones WHERE nombre = 'Rayos X'), 'Técnico Radiólogo', TRUE, NOW()),
('V-67890123', 'Carmen', 'López', '0414-6789012', 'carmen.lopez@salvadorallende.gob.ve', 
    (SELECT id FROM ubicaciones WHERE nombre = 'Farmacia'), 'Farmacéutico', TRUE, NOW()),
('V-78901234', 'Pedro', 'Ramírez', '0424-7890123', 'pedro.ramirez@salvadorallende.gob.ve', 
    (SELECT id FROM ubicaciones WHERE nombre = 'Mantenimiento'), 'Jefe de Mantenimiento', TRUE, NOW()),
('V-89012345', 'Laura', 'Torres', '0412-8901234', 'laura.torres@salvadorallende.gob.ve', 
    (SELECT id FROM ubicaciones WHERE nombre = 'Departamento de Bienes'), 'Asistente de Bienes', TRUE, NOW());

-- ============================================
-- Categorías SUDEBIP - Nivel 1: Categorías Generales
-- ============================================
INSERT INTO categorias_sudebip (codigo, nivel, descripcion, categoria_padre_id) VALUES
-- Equipos médicos y de laboratorio
('14000-0000', 'GENERAL', 'Equipos médicos y de laboratorio', NULL),
-- Equipos de transporte
('15000-0000', 'GENERAL', 'Equipos de transporte, tracción y elevación', NULL),
-- Equipos de computación
('16000-0000', 'GENERAL', 'Equipos de computación', NULL),
-- Maquinaria y equipos diversos
('17000-0000', 'GENERAL', 'Maquinaria y equipos diversos', NULL),
-- Mobiliario y equipos de oficina
('31000-0000', 'GENERAL', 'Mobiliario y equipos de oficina', NULL);

-- ============================================
-- Categorías SUDEBIP - Nivel 2: Subcategorías
-- ============================================
INSERT INTO categorias_sudebip (codigo, nivel, descripcion, categoria_padre_id) VALUES
-- Equipos médicos
('14010-0000', 'SUBCATEGORIA', 'Equipos médicos quirúrgicos', (SELECT id FROM categorias_sudebip WHERE codigo = '14000-0000')),
('14020-0000', 'SUBCATEGORIA', 'Equipos de laboratorio', (SELECT id FROM categorias_sudebip WHERE codigo = '14000-0000')),
('14030-0000', 'SUBCATEGORIA', 'Equipos de diagnóstico', (SELECT id FROM categorias_sudebip WHERE codigo = '14000-0000')),
-- Transporte
('15010-0000', 'SUBCATEGORIA', 'Vehículos automotores terrestres', (SELECT id FROM categorias_sudebip WHERE codigo = '15000-0000')),
-- Computación
('16010-0000', 'SUBCATEGORIA', 'Equipos de procesamiento de datos', (SELECT id FROM categorias_sudebip WHERE codigo = '16000-0000')),
('16020-0000', 'SUBCATEGORIA', 'Equipos periféricos', (SELECT id FROM categorias_sudebip WHERE codigo = '16000-0000')),
-- Mobiliario
('31010-0000', 'SUBCATEGORIA', 'Mobiliario de oficina', (SELECT id FROM categorias_sudebip WHERE codigo = '31000-0000')),
('31020-0000', 'SUBCATEGORIA', 'Mobiliario médico', (SELECT id FROM categorias_sudebip WHERE codigo = '31000-0000'));

-- ============================================
-- Categorías SUDEBIP - Nivel 3: Categorías Específicas
-- ============================================
INSERT INTO categorias_sudebip (codigo, nivel, descripcion, categoria_padre_id) VALUES
-- Equipos médicos específicos
('14010-0001', 'ESPECIFICA', 'Camillas', (SELECT id FROM categorias_sudebip WHERE codigo = '14010-0000')),
('14010-0002', 'ESPECIFICA', 'Desfibriladores', (SELECT id FROM categorias_sudebip WHERE codigo = '14010-0000')),
('14010-0003', 'ESPECIFICA', 'Electrocardiógrafos', (SELECT id FROM categorias_sudebip WHERE codigo = '14010-0000')),
('14010-0004', 'ESPECIFICA', 'Tensiómetros', (SELECT id FROM categorias_sudebip WHERE codigo = '14010-0000')),
('14020-0001', 'ESPECIFICA', 'Microscopios', (SELECT id FROM categorias_sudebip WHERE codigo = '14020-0000')),
('14020-0002', 'ESPECIFICA', 'Centrífugas', (SELECT id FROM categorias_sudebip WHERE codigo = '14020-0000')),
('14020-0003', 'ESPECIFICA', 'Analizadores hematológicos', (SELECT id FROM categorias_sudebip WHERE codigo = '14020-0000')),
('14030-0001', 'ESPECIFICA', 'Equipos de rayos X', (SELECT id FROM categorias_sudebip WHERE codigo = '14030-0000')),
('14030-0002', 'ESPECIFICA', 'Ecógrafos', (SELECT id FROM categorias_sudebip WHERE codigo = '14030-0000')),
-- Vehículos
('15010-0001', 'ESPECIFICA', 'Ambulancias', (SELECT id FROM categorias_sudebip WHERE codigo = '15010-0000')),
('15010-0002', 'ESPECIFICA', 'Vehículos administrativos', (SELECT id FROM categorias_sudebip WHERE codigo = '15010-0000')),
-- Computación
('16010-0001', 'ESPECIFICA', 'Computadoras de escritorio', (SELECT id FROM categorias_sudebip WHERE codigo = '16010-0000')),
('16010-0002', 'ESPECIFICA', 'Computadoras portátiles', (SELECT id FROM categorias_sudebip WHERE codigo = '16010-0000')),
('16010-0003', 'ESPECIFICA', 'Servidores', (SELECT id FROM categorias_sudebip WHERE codigo = '16010-0000')),
('16020-0001', 'ESPECIFICA', 'Impresoras', (SELECT id FROM categorias_sudebip WHERE codigo = '16020-0000')),
('16020-0002', 'ESPECIFICA', 'Escáneres', (SELECT id FROM categorias_sudebip WHERE codigo = '16020-0000')),
-- Mobiliario
('31010-0001', 'ESPECIFICA', 'Escritorios', (SELECT id FROM categorias_sudebip WHERE codigo = '31010-0000')),
('31010-0002', 'ESPECIFICA', 'Sillas de oficina', (SELECT id FROM categorias_sudebip WHERE codigo = '31010-0000')),
('31010-0003', 'ESPECIFICA', 'Archivadores', (SELECT id FROM categorias_sudebip WHERE codigo = '31010-0000')),
('31020-0001', 'ESPECIFICA', 'Camillas médicas', (SELECT id FROM categorias_sudebip WHERE codigo = '31020-0000')),
('31020-0002', 'ESPECIFICA', 'Mesas de exploración', (SELECT id FROM categorias_sudebip WHERE codigo = '31020-0000'));

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
    valor_adquisicion,
    fecha_adquisicion,
    estado,
    condicion,
    ubicacion_id,
    responsable_id,
    categoria_sudebip_id,
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
    150000.00,
    '2020-03-15',
    'ACTIVO',
    'EXCELENTE',
    (SELECT id FROM ubicaciones WHERE nombre = 'Emergencias'),
    (SELECT id FROM responsables WHERE cedula = 'V-12345678'),
    (SELECT id FROM categorias_sudebip WHERE codigo = '15010-0001'),
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
    25000.00,
    '2021-06-10',
    'ACTIVO',
    'BUENO',
    (SELECT id FROM ubicaciones WHERE nombre = 'Administración'),
    (SELECT id FROM responsables WHERE cedula = 'V-23456789'),
    (SELECT id FROM categorias_sudebip WHERE codigo = '16010-0001'),
    1
),
-- Electrocardiografo
(
    '14010-0003',
    'SA-ECG-001',
    'SA-ECG-001',
    'Electrocardiógrafo digital de 12 derivaciones',
    'Philips',
    'PageWriter TC70',
    'ECG456789',
    45000.00,
    '2019-11-20',
    'ACTIVO',
    'BUENO',
    (SELECT id FROM ubicaciones WHERE nombre = 'Emergencias'),
    (SELECT id FROM responsables WHERE cedula = 'V-12345678'),
    (SELECT id FROM categorias_sudebip WHERE codigo = '14010-0003'),
    1
);

-- ============================================
-- Notas importantes
-- ============================================
-- Los códigos de barras se generarán automáticamente en la aplicación
-- Las contraseñas deben cambiarse en producción
-- Este es un conjunto de datos mínimo para iniciar el sistema
