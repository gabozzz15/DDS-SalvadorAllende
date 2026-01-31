-- Migración: Agregar soporte para transferencias temporales
-- Fecha: 2026-01-10
-- Descripción: Agrega campos para diferenciar transferencias permanentes vs temporales

ALTER TABLE transferencias
ADD COLUMN tipo_transferencia ENUM('PERMANENTE', 'TEMPORAL') DEFAULT 'PERMANENTE' AFTER estatus;

ALTER TABLE transferencias
ADD COLUMN fecha_retorno_esperada TIMESTAMP NULL AFTER tipo_transferencia
COMMENT 'Fecha esperada de devolución para transferencias temporales';

ALTER TABLE transferencias
ADD COLUMN fecha_devolucion TIMESTAMP NULL AFTER fecha_retorno_esperada
COMMENT 'Fecha real de devolución de transferencia temporal';

-- Crear índice para mejorar búsquedas de transferencias temporales activas
CREATE INDEX idx_tipo_transferencia ON transferencias(tipo_transferencia);
CREATE INDEX idx_fecha_retorno ON transferencias(fecha_retorno_esperada) WHERE fecha_devolucion IS NULL;
