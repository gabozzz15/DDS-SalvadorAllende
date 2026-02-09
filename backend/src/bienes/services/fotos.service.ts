import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Foto } from '../entities/foto.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FotosService {
    private readonly uploadPath = path.join(process.cwd(), 'uploads', 'bienes');

    constructor(
        @InjectRepository(Foto)
        private fotosRepository: Repository<Foto>,
    ) {
        // Crear directorio de uploads si no existe
        this.ensureUploadDirectory();
    }

    private async ensureUploadDirectory() {
        try {
            await fs.mkdir(this.uploadPath, { recursive: true });
        } catch (error) {
            console.error('Error creando directorio de uploads:', error);
        }
    }

    /**
     * Guarda una foto en el sistema de archivos y registra en BD
     */
    async guardarFoto(
        file: Express.Multer.File,
        idBien: number,
        uploadedBy: number,
        descripcion?: string,
        esPrincipal: boolean = false,
    ): Promise<Foto> {
        // Validar tamaño (máximo 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new BadRequestException('El archivo excede el tamaño máximo de 5MB');
        }

        // Validar tipo MIME
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new BadRequestException('Solo se permiten archivos JPG y PNG');
        }

        // Generar nombre único
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const nombreArchivo = `bien_${idBien}_${timestamp}${extension}`;
        const rutaCompleta = path.join(this.uploadPath, nombreArchivo);

        // Guardar archivo
        await fs.writeFile(rutaCompleta, file.buffer);

        // Si es principal, desmarcar otras fotos principales del mismo bien
        if (esPrincipal) {
            await this.fotosRepository.update(
                { idBien, esPrincipal: true },
                { esPrincipal: false }
            );
        }

        // Crear registro en BD
        const foto = this.fotosRepository.create({
            idBien,
            nombreArchivo,
            rutaArchivo: `/uploads/bienes/${nombreArchivo}`,
            tamanoBytes: file.size,
            tipoMime: file.mimetype,
            esPrincipal,
            descripcion,
            uploadedBy,
        });

        return await this.fotosRepository.save(foto);
    }

    /**
     * Obtiene todas las fotos de un bien
     */
    async obtenerFotosPorBien(idBien: number): Promise<Foto[]> {
        return await this.fotosRepository.find({
            where: { idBien },
            order: { esPrincipal: 'DESC', createdAt: 'DESC' },
        });
    }

    /**
     * Obtiene la foto principal de un bien
     */
    async obtenerFotoPrincipal(idBien: number): Promise<Foto | null> {
        return await this.fotosRepository.findOne({
            where: { idBien, esPrincipal: true },
        });
    }

    /**
     * Elimina una foto
     */
    async eliminarFoto(id: number): Promise<void> {
        const foto = await this.fotosRepository.findOne({ where: { id } });

        if (!foto) {
            throw new NotFoundException('Foto no encontrada');
        }

        // Eliminar archivo físico
        const rutaCompleta = path.join(process.cwd(), 'uploads', 'bienes', foto.nombreArchivo);
        try {
            await fs.unlink(rutaCompleta);
        } catch (error) {
            console.error('Error eliminando archivo:', error);
        }

        // Eliminar registro de BD
        await this.fotosRepository.remove(foto);
    }

    /**
     * Marca una foto como principal
     */
    async marcarComoPrincipal(id: number): Promise<Foto> {
        const foto = await this.fotosRepository.findOne({ where: { id } });

        if (!foto) {
            throw new NotFoundException('Foto no encontrada');
        }

        // Desmarcar otras fotos principales del mismo bien
        await this.fotosRepository.update(
            { idBien: foto.idBien, esPrincipal: true },
            { esPrincipal: false }
        );

        // Marcar esta como principal
        foto.esPrincipal = true;
        return await this.fotosRepository.save(foto);
    }
}
