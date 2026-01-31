-- ============================================
-- Migración: Eliminar columna valor_adquisicion
-- Fecha: 2025-11-20
-- Descripción: Elimina la columna valor_adquisicion de la tabla bienes
-- ============================================

USE bienes_salvador_allende;

-- Eliminar la columna valor_adquisicion de la tabla bienes
ALTER TABLE bienes DROP COLUMN valor_adquisicion;

-- Verificar cambios
DESCRIBE bienes;
