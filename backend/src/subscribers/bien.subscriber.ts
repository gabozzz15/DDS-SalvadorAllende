import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent,
} from 'typeorm';
import { Bien } from '../bienes/entities/bien.entity';
import { LogAuditoria } from '../auditoria/entities/log-auditoria.entity';

@EventSubscriber()
export class BienSubscriber implements EntitySubscriberInterface<Bien> {
    listenTo() {
        return Bien;
    }

    async afterInsert(event: InsertEvent<Bien>) {
        try {
            const userId = (event.entity as any).createdBy || null;

            const logData: any = {
                accion: 'CREATE',
                entidad: 'bienes',
                entidadId: event.entity.id,
                detalles: {
                    codigoInterno: event.entity.codigoInterno,
                    descripcion: event.entity.descripcion,
                    idUnidadAdministrativa: event.entity.idUnidadAdministrativa,
                    idResponsableUso: event.entity.idResponsableUso,
                },
                ipAddress: '127.0.0.1',
                userAgent: 'System',
            };
            if (userId) logData.userId = userId;

            const log = event.manager.create(LogAuditoria, logData);
            await event.manager.save(log);
        } catch (error) {
            console.error('Error logging audit for Bien insert:', error);
        }
    }

    async afterUpdate(event: UpdateEvent<Bien>) {
        try {
            if (!event.entity) return;

            const userId = (event.entity as any).createdBy || null;
            const changes: any = {};

            // Detectar cambios
            if (event.updatedColumns && event.updatedColumns.length > 0) {
                event.updatedColumns.forEach((column) => {
                    const columnName = column.propertyName;
                    changes[columnName] = {
                        before: event.databaseEntity?.[columnName],
                        after: event.entity?.[columnName],
                    };
                });
            }

            const logData: any = {
                accion: 'UPDATE',
                entidad: 'bienes',
                entidadId: event.entity.id,
                detalles: changes,
                ipAddress: '127.0.0.1',
                userAgent: 'System',
            };
            if (userId) logData.userId = userId;

            const log = event.manager.create(LogAuditoria, logData);
            await event.manager.save(log);
        } catch (error) {
            console.error('Error logging audit for Bien update:', error);
        }
    }

    async beforeRemove(event: RemoveEvent<Bien>) {
        try {
            if (!event.entity) return;

            const userId = (event.entity as any).createdBy || null;

            const logData: any = {
                accion: 'DELETE',
                entidad: 'bienes',
                entidadId: event.entity.id,
                detalles: {
                    codigoInterno: event.entity.codigoInterno,
                    descripcion: event.entity.descripcion,
                },
                ipAddress: '127.0.0.1',
                userAgent: 'System',
            };
            if (userId) logData.userId = userId;

            const log = event.manager.create(LogAuditoria, logData);
            await event.manager.save(log);
        } catch (error) {
            console.error('Error logging audit for Bien delete:', error);
        }
    }
}
