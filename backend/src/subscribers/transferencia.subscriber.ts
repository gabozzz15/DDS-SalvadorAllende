import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from 'typeorm';
import { Transferencia } from '../transferencias/entities/transferencia.entity';
import { LogAuditoria } from '../auditoria/entities/log-auditoria.entity';

@EventSubscriber()
export class TransferenciaSubscriber implements EntitySubscriberInterface<Transferencia> {
    listenTo() {
        return Transferencia;
    }

    async afterInsert(event: InsertEvent<Transferencia>) {
        try {
            const logData: any = {
                accion: 'CREATE',
                entidad: 'transferencias',
                entidadId: event.entity.id,
                detalles: {
                    idBien: event.entity.idBien,
                    ubicacionOrigen: event.entity.ubicacionOrigenId,
                    ubicacionDestino: event.entity.ubicacionDestinoId,
                    responsableOrigen: event.entity.responsableOrigenId,
                    responsableDestino: event.entity.responsableDestinoId,
                    estatus: event.entity.estatus,
                },
                ipAddress: '127.0.0.1',
                userAgent: 'System',
            };
            if (event.entity.solicitadoPor) logData.userId = event.entity.solicitadoPor;

            const log = event.manager.create(LogAuditoria, logData);
            await event.manager.save(log);
        } catch (error) {
            console.error('Error logging audit for Transferencia insert:', error);
        }
    }

    async afterUpdate(event: UpdateEvent<Transferencia>) {
        try {
            if (!event.entity) return;

            const changes: any = {};

            if (event.updatedColumns && event.updatedColumns.length > 0) {
                event.updatedColumns.forEach((column) => {
                    const columnName = column.propertyName;
                    changes[columnName] = {
                        before: event.databaseEntity?.[columnName],
                        after: event.entity?.[columnName],
                    };
                });
            }

            const userId = event.entity.aprobadoPor || event.entity.solicitadoPor;
            const logData: any = {
                accion: 'UPDATE',
                entidad: 'transferencias',
                entidadId: event.entity.id,
                detalles: changes,
                ipAddress: '127.0.0.1',
                userAgent: 'System',
            };
            if (userId) logData.userId = userId;

            const log = event.manager.create(LogAuditoria, logData);
            await event.manager.save(log);
        } catch (error) {
            console.error('Error logging audit for Transferencia update:', error);
        }
    }
}
