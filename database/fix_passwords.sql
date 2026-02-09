-- ============================================
-- Script para actualizar la contraseña del usuario admin
-- Ejecuta esto en MySQL para corregir la contraseña
-- ============================================

USE bienes_salvador_allende;

-- Actualizar la contraseña del usuario admin
-- Hash bcrypt válido para 'admin123'
UPDATE users 
SET password = '$2b$10$K7L1OJ45/4Y2nIZGnWGeL.xJR7O5/dxC62LH86P8Bl8xVTjbh3F4i'
WHERE username = 'admin';

-- Actualizar la contraseña del usuario usuario1
UPDATE users 
SET password = '$2b$10$K7L1OJ45/4Y2nIZGnWGeL.xJR7O5/dxC62LH86P8Bl8xVTjbh3F4i'
WHERE username = 'usuario1';

-- Verificar que se actualizó correctamente
SELECT id, username, nombre_completo, role, activo 
FROM users;
