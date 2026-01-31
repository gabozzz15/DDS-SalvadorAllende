const fs = require('fs');
const path = require('path');

// Archivos a actualizar
const files = [
    'frontend/src/components/BienModal.tsx',
    'frontend/src/pages/Bienes.tsx',
    'frontend/src/pages/Responsables.tsx',
    'frontend/src/pages/Transferencias.tsx',
    'frontend/src/pages/Desincorporaciones.tsx'
];

// Reemplazos a realizar
const replacements = [
    // Campos de Bien
    { from: /\bubicacionId\b/g, to: 'idUnidadAdministrativa' },
    { from: /\bresponsableId\b/g, to: 'idResponsableUso' },
    { from: /\bcategoriaSudebipId\b/g, to: 'idCategoriaEspecifica' },
    { from: /\b\.estado\b/g, to: '.estatusUso' },
    { from: /'estado'/g, to: "'estatusUso'" },
    { from: /"estado"/g, to: '"estatusUso"' },
    { from: /\b\.condicion\b/g, to: '.condicionFisica' },
    { from: /'condicion'/g, to: "'condicionFisica'" },
    { from: /"condicion"/g, to: '"condicionFisica"' },
    { from: /\b\.serial\b/g, to: '.serialBien' },
    { from: /'serial'/g, to: "'serialBien'" },
    { from: /"serial"/g, to: '"serialBien"' },
    { from: /\bobservaciones\b/g, to: 'observacion' },

    // Campos de Transferencia/Desincorporacion
    { from: /\bbienId\b/g, to: 'idBien' },

    // Campos de Responsable
    { from: /\bdepartamentoId\b/g, to: 'idUnidadAdscripcion' },

    // API endpoints
    { from: /['"]\/ubicaciones['"]/g, to: "'/unidades-administrativas'" },
    { from: /\/approve/g, to: '/aprobar' },
    { from: /\/reject/g, to: '/rechazar' },

    // Relaciones en objetos
    { from: /\.ubicacion\?/g, to: '.unidadAdministrativa?' },
    { from: /\.responsable\?/g, to: '.responsableUso?' },
    { from: /\.categoriaSudebip\?/g, to: '.categoriaEspecifica?' },
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    replacements.forEach(({ from, to }) => {
        content = content.replace(from, to);
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Actualizado: ${file}`);
});

console.log('\n🎉 Migración de frontend completada!');
