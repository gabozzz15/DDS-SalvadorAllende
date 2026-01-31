import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta, TipoAlerta, SeveridadAlerta } from './entities/alerta.entity';
import { BienesService } from '../bienes/bienes.service';
import { EstatusUso, CondicionFisica } from '../bienes/entities/bien.entity';

@Injectable()
export class AlertasService {
    constructor(
        @InjectRepository(Alerta)
        private alertasRepository: Repository<Alerta>,
        private bienesService: BienesService,
    ) { }

    async create(
        tipo: TipoAlerta,
        severidad: SeveridadAlerta,
        titulo: string,
        descripcion: string,
        bienId?: number,
    ): Promise<Alerta> {
        const alerta = this.alertasRepository.create({
            tipo,
            severidad,
            titulo,
            descripcion,
            bienId,
        });

        return this.alertasRepository.save(alerta);
    }

    async findAll(filters?: {
        tipo?: TipoAlerta;
        severidad?: SeveridadAlerta;
        leida?: boolean;
    }): Promise<Alerta[]> {
        const where: any = {};

        if (filters?.tipo) {
            where.tipo = filters.tipo;
        }

        if (filters?.severidad) {
            where.severidad = filters.severidad;
        }

        if (filters?.leida !== undefined) {
            where.leida = filters.leida;
        }

        return this.alertasRepository.find({
            where,
            relations: ['bien'],
            order: { fechaCreacion: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Alerta> {
        const alerta = await this.alertasRepository.findOne({
            where: { id },
            relations: ['bien'],
        });

        if (!alerta) {
            throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
        }

        return alerta;
    }

    async markAsRead(id: number): Promise<Alerta> {
        const alerta = await this.findOne(id);
        alerta.leida = true;
        alerta.fechaLectura = new Date();
        return this.alertasRepository.save(alerta);
    }

    async markAllAsRead(): Promise<void> {
        await this.alertasRepository.update(
            { leida: false },
            { leida: true, fechaLectura: new Date() },
        );
    }

    async remove(id: number): Promise<void> {
        const alerta = await this.findOne(id);
        await this.alertasRepository.remove(alerta);
    }

    async generateAutomaticAlerts(): Promise<void> {
        const bienes = await this.bienesService.findAll();

        for (const bien of bienes) {
            // Alerta por inventario vencido (obsoleto o inutilizable)
            if (
                bien.condicionFisica === CondicionFisica.OBSOLETO ||
                bien.condicionFisica === CondicionFisica.MALO
            ) {
                const existingAlert = await this.alertasRepository.findOne({
                    where: {
                        bienId: bien.id,
                        tipo: TipoAlerta.INVENTARIO_VENCIDO,
                        leida: false,
                    },
                });

                if (!existingAlert) {
                    await this.create(
                        TipoAlerta.INVENTARIO_VENCIDO,
                        SeveridadAlerta.ALTA,
                        `Bien en condición ${bien.condicionFisica}`,
                        `El bien "${bien.descripcion}" (${bien.codigoInterno}) está en condición ${bien.condicionFisica} y requiere atención`,
                        bien.id,
                    );
                }
            }

            // Alerta por bienes sin trazabilidad
            if (!bien.idResponsableUso || !bien.idUnidadAdministrativa) {
                const existingAlert = await this.alertasRepository.findOne({
                    where: {
                        bienId: bien.id,
                        tipo: TipoAlerta.SIN_TRAZABILIDAD,
                        leida: false,
                    },
                });

                if (!existingAlert) {
                    await this.create(
                        TipoAlerta.SIN_TRAZABILIDAD,
                        SeveridadAlerta.MEDIA,
                        'Bien sin trazabilidad completa',
                        `El bien "${bien.descripcion}" (${bien.codigoInterno}) no tiene ${!bien.idResponsableUso ? 'responsable' : 'ubicación'} asignado`,
                        bien.id,
                    );
                }
            }
        }
    }

    async getStatistics(): Promise<any> {
        const total = await this.alertasRepository.count();
        const noLeidas = await this.alertasRepository.count({ where: { leida: false } });
        const porSeveridad = {
            baja: await this.alertasRepository.count({ where: { severidad: SeveridadAlerta.BAJA } }),
            media: await this.alertasRepository.count({ where: { severidad: SeveridadAlerta.MEDIA } }),
            alta: await this.alertasRepository.count({ where: { severidad: SeveridadAlerta.ALTA } }),
            critica: await this.alertasRepository.count({ where: { severidad: SeveridadAlerta.CRITICA } }),
        };

        return {
            total,
            noLeidas,
            porSeveridad,
        };
    }
}
