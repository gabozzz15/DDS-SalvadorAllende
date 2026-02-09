import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BienResponsableHistorico } from './entities/bien-responsable-historico.entity';
import { BienUsuarioHistorico } from './entities/bien-usuario-historico.entity';
import {
    RegistrarResponsableDto,
    RegistrarAccionUsuarioDto,
    CambiarResponsableDto,
} from './dto/historial.dto';

@Injectable()
export class HistorialService {
    constructor(
        @InjectRepository(BienResponsableHistorico)
        private responsablesHistoricoRepo: Repository<BienResponsableHistorico>,
        @InjectRepository(BienUsuarioHistorico)
        private usuariosHistoricoRepo: Repository<BienUsuarioHistorico>,
    ) { }

    /**
     * Registra un nuevo responsable para un bien
     */
    async registrarResponsable(dto: RegistrarResponsableDto) {
        const registro = this.responsablesHistoricoRepo.create({
            idBien: dto.idBien,
            idResponsable: dto.idResponsable,
            motivoAsignacion: dto.motivoAsignacion,
            asignadoPor: dto.asignadoPor,
            observaciones: dto.observaciones,
            activo: true,
        });

        return await this.responsablesHistoricoRepo.save(registro);
    }

    /**
     * Cambia el responsable de un bien (desactiva el anterior y crea uno nuevo)
     */
    async cambiarResponsable(dto: CambiarResponsableDto) {
        // Desactivar el responsable anterior
        await this.responsablesHistoricoRepo.update(
            {
                idBien: dto.idBien,
                idResponsable: dto.idResponsableAnterior,
                activo: true,
            },
            {
                activo: false,
                fechaFin: new Date(),
            },
        );

        // Registrar el nuevo responsable
        return await this.registrarResponsable({
            idBien: dto.idBien,
            idResponsable: dto.idResponsableNuevo,
            motivoAsignacion: dto.motivo,
            asignadoPor: dto.cambiadoPor,
        });
    }

    /**
     * Registra una acción realizada por un usuario sobre un bien
     */
    async registrarAccionUsuario(dto: RegistrarAccionUsuarioDto) {
        const registro = this.usuariosHistoricoRepo.create({
            idBien: dto.idBien,
            idUsuario: dto.idUsuario,
            accion: dto.accion as any,
            detalles: dto.detalles,
            ipAddress: dto.ipAddress,
        });

        return await this.usuariosHistoricoRepo.save(registro);
    }

    /**
     * Obtiene el historial completo de responsables de un bien
     */
    async obtenerHistorialResponsables(idBien: number) {
        return await this.responsablesHistoricoRepo.find({
            where: { idBien },
            relations: ['responsable', 'usuarioAsignador'],
            order: { fechaAsignacion: 'DESC' },
        });
    }

    /**
     * Obtiene el historial completo de acciones de usuarios sobre un bien
     */
    async obtenerHistorialUsuarios(idBien: number) {
        return await this.usuariosHistoricoRepo.find({
            where: { idBien },
            relations: ['usuario'],
            order: { fechaAccion: 'DESC' },
        });
    }

    /**
     * Obtiene el responsable actual de un bien
     */
    async obtenerResponsableActual(idBien: number) {
        return await this.responsablesHistoricoRepo.findOne({
            where: { idBien, activo: true },
            relations: ['responsable'],
        });
    }

    /**
     * Obtiene todos los bienes que ha tenido un responsable
     */
    async obtenerBienesPorResponsable(idResponsable: number) {
        return await this.responsablesHistoricoRepo.find({
            where: { idResponsable },
            relations: ['bien'],
            order: { fechaAsignacion: 'DESC' },
        });
    }

    /**
     * Obtiene todas las acciones realizadas por un usuario
     */
    async obtenerAccionesPorUsuario(idUsuario: number) {
        return await this.usuariosHistoricoRepo.find({
            where: { idUsuario },
            relations: ['bien'],
            order: { fechaAccion: 'DESC' },
        });
    }
}
