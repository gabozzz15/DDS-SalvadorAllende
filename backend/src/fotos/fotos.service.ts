import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Foto } from './entities/foto.entity';
import { CreateFotoDto } from './dto/create-foto.dto';
import { BienesService } from '../bienes/bienes.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class FotosService {
    private readonly uploadDir = './uploads/fotos';
    private readonly thumbnailDir = './uploads/thumbnails';

    constructor(
        @InjectRepository(Foto)
        private fotosRepository: Repository<Foto>,
        private bienesService: BienesService,
    ) {
        this.ensureUploadDirectories();
    }

    private async ensureUploadDirectories() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            await fs.mkdir(this.thumbnailDir, { recursive: true });
        } catch (error) {
            console.error('Error creating upload directories:', error);
        }
    }

    async create(
        createFotoDto: CreateFotoDto,
        file: Express.Multer.File,
        userId: number,
    ): Promise<Foto> {
        // Validar que el bien existe
        await this.bienesService.findOne(createFotoDto.bienId);

        // Validar tipo de archivo
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('El archivo debe ser una imagen');
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${createFotoDto.bienId}_${timestamp}${ext}`;
        const filepath = path.join(this.uploadDir, filename);
        const thumbnailPath = path.join(this.thumbnailDir, `thumb_${filename}`);

        try {
            // Guardar imagen original
            await fs.writeFile(filepath, file.buffer);

            // Crear thumbnail (300x300)
            await sharp(file.buffer)
                .resize(300, 300, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toFile(thumbnailPath);

            // Crear registro en BD
            const foto = this.fotosRepository.create({
                ...createFotoDto,
                rutaArchivo: filepath,
                nombreOriginal: file.originalname,
                tamanoBytes: file.size,
                mimeType: file.mimetype,
                uploadedBy: userId,
            });

            return this.fotosRepository.save(foto);
        } catch (error) {
            // Limpiar archivos si hay error
            try {
                await fs.unlink(filepath);
                await fs.unlink(thumbnailPath);
            } catch { }
            throw new BadRequestException('Error al guardar la imagen');
        }
    }

    async findAll(filters?: {
        bienId?: number;
        tipoProceso?: string;
        procesoId?: number;
    }): Promise<Foto[]> {
        const where: any = {};

        if (filters?.bienId) {
            where.bienId = filters.bienId;
        }

        if (filters?.tipoProceso) {
            where.tipoProceso = filters.tipoProceso;
        }

        if (filters?.procesoId) {
            where.procesoId = filters.procesoId;
        }

        return this.fotosRepository.find({
            where,
            relations: ['bien', 'uploader'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Foto> {
        const foto = await this.fotosRepository.findOne({
            where: { id },
            relations: ['bien', 'uploader'],
        });

        if (!foto) {
            throw new NotFoundException(`Foto con ID ${id} no encontrada`);
        }

        return foto;
    }

    async getFileBuffer(id: number): Promise<Buffer> {
        const foto = await this.findOne(id);

        try {
            return await fs.readFile(foto.rutaArchivo);
        } catch (error) {
            throw new NotFoundException('Archivo de imagen no encontrado');
        }
    }

    async getThumbnail(id: number): Promise<Buffer> {
        const foto = await this.findOne(id);
        const thumbnailPath = path.join(
            this.thumbnailDir,
            `thumb_${path.basename(foto.rutaArchivo)}`,
        );

        try {
            return await fs.readFile(thumbnailPath);
        } catch (error) {
            // Si no existe thumbnail, devolver imagen original redimensionada
            const buffer = await this.getFileBuffer(id);
            return sharp(buffer)
                .resize(300, 300, { fit: 'inside' })
                .toBuffer();
        }
    }

    async remove(id: number): Promise<void> {
        const foto = await this.findOne(id);

        // Eliminar archivos físicos
        try {
            await fs.unlink(foto.rutaArchivo);
            const thumbnailPath = path.join(
                this.thumbnailDir,
                `thumb_${path.basename(foto.rutaArchivo)}`,
            );
            await fs.unlink(thumbnailPath);
        } catch (error) {
            console.error('Error eliminando archivos:', error);
        }

        // Eliminar registro de BD
        await this.fotosRepository.remove(foto);
    }
}
