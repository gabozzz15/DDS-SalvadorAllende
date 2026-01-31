import { DataSource } from 'typeorm';
import { UnidadAdministrativa } from '../../unidades-administrativas/entities/unidad-administrativa.entity';

export async function seedDepartamentos(dataSource: DataSource) {
    const repository = dataSource.getRepository(UnidadAdministrativa);

    // 23 Departamentos del Ambulatorio Salvador Allende
    const departamentos = [
        {
            codigoUnidadSudebip: 'UA-001',
            nombre: 'Almacén',
            descripcion: 'Punto de entrada de todos los bienes institucionales',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-002',
            nombre: 'Enfermería',
            descripcion: 'Departamento de Enfermería',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-003',
            nombre: 'Laboratorio',
            descripcion: 'Departamento de Laboratorio Clínico',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-004',
            nombre: 'Odontología',
            descripcion: 'Departamento de Odontología',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-005',
            nombre: 'RX (Rayos X)',
            descripcion: 'Departamento de Rayos X',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-006',
            nombre: 'Promoción Social',
            descripcion: 'Departamento de Promoción Social',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-007',
            nombre: 'Registro y Estadística',
            descripcion: 'Departamento de Registro y Estadística de Salud',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-008',
            nombre: 'Mantenimiento',
            descripcion: 'Departamento de Mantenimiento',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-009',
            nombre: 'Bienes Nacionales',
            descripcion: 'Departamento de Bienes Nacionales',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-010',
            nombre: 'Seguridad',
            descripcion: 'Departamento de Seguridad',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-011',
            nombre: 'Saneamiento',
            descripcion: 'Departamento de Saneamiento Ambiental',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-012',
            nombre: 'Emergencia',
            descripcion: 'Departamento de Emergencia',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-013',
            nombre: 'Quirófano',
            descripcion: 'Departamento de Quirófano',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-014',
            nombre: 'Ginecología',
            descripcion: 'Departamento de Ginecología y Obstetricia',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-015',
            nombre: 'Oftalmología',
            descripcion: 'Departamento de Oftalmología',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-016',
            nombre: 'Pediatría',
            descripcion: 'Departamento de Pediatría',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-017',
            nombre: 'Traumatología',
            descripcion: 'Departamento de Traumatología',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-018',
            nombre: 'Nefrología',
            descripcion: 'Departamento de Nefrología',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-019',
            nombre: 'Cirugía Pediátrica',
            descripcion: 'Departamento de Cirugía Pediátrica',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-020',
            nombre: 'Cirugía Adulto',
            descripcion: 'Departamento de Cirugía de Adultos',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-021',
            nombre: 'Triaje',
            descripcion: 'Departamento de Triaje',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-022',
            nombre: 'Salud Vial',
            descripcion: 'Departamento de Salud Vial',
            activo: true,
        },
        {
            codigoUnidadSudebip: 'UA-023',
            nombre: 'Salud Mental',
            descripcion: 'Departamento de Salud Mental',
            activo: true,
        },
    ];

    console.log('🏥 Seeding 23 Departamentos del Ambulatorio Salvador Allende...');

    for (const departamento of departamentos) {
        const existing = await repository.findOne({
            where: { codigoUnidadSudebip: departamento.codigoUnidadSudebip },
        });

        if (!existing) {
            await repository.save(departamento);
            console.log(`✅ Creado: ${departamento.codigoUnidadSudebip} - ${departamento.nombre}`);
        } else {
            // Actualizar si ya existe
            await repository.update(
                { codigoUnidadSudebip: departamento.codigoUnidadSudebip },
                {
                    nombre: departamento.nombre,
                    descripcion: departamento.descripcion,
                    activo: departamento.activo,
                }
            );
            console.log(`🔄 Actualizado: ${departamento.codigoUnidadSudebip} - ${departamento.nombre}`);
        }
    }

    console.log('✅ Seed de departamentos completado!');
    console.log('📍 Almacén (UA-001) configurado como punto de entrada');
}
