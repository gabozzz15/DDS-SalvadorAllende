-- Migración: Actualizar enum CondicionFisica en tabla bienes
-- Fecha: 2026-01-11
-- Descripción: Agregar los valores 'AVERIADO', 'DETERIORADO', 'INSERVIBLE' al enum condicion_fisica

ALTER TABLE bienes 
MODIFY COLUMN condicion_fisica ENUM('EXCELENTE', 'BUENO', 'REGULAR', 'MALO', 'OBSOLETO', 'AVERIADO', 'DETERIORADO', 'INSERVIBLE') 
NOT NULL DEFAULT 'BUENO';
