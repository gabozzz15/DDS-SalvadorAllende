-- Migration: Update codigo_barras column to TEXT type
-- Reason: Base64 barcode images exceed VARCHAR(100) limit
-- Date: 2025-11-22

USE dds_salvador_allende;

-- Remove unique constraint and index on codigo_barras
ALTER TABLE bienes 
DROP INDEX codigo_barras;

-- Change column type to TEXT
ALTER TABLE bienes 
MODIFY COLUMN codigo_barras TEXT COMMENT 'Código de barras Code128 (Base64 PNG)';
