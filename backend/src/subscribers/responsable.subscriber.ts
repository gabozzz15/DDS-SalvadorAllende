import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent,
} from 'typeorm';
import { Responsable } from '../responsables/entities/responsable.entity';
import { LogAuditoria } from '../auditoria/entities/log-auditoria.entity';

@EventSubscriber()
export class ResponsableSubscriber implements EntitySubscriberInterface<Responsable> {
    listenTo() {
        return Responsable;
    }

    async afterInsert(event: InsertEvent<Responsable>) {
        try {
            const log = event.manager.create(LogAuditoria, {
                accion: 'CREATE',
                entidad: 'responsables',
                entidadId: event.entity.id,
                detalles: {
                    cedula: event.entity.cedula,
                    nombres: event.entity.nombres,
                    apellidos: event.entity.apellidos,
                    cargo: event.entity.cargo,
                },
                ipAddress: '127.0.0.1',
                userAgent: 'System',
            });

            await event.manager.save(log);
        } catch (error) {
            console.error('Error logging audit for Responsable insert:', error);
        }
    }

    async afterUpdate(event: UpdateEvent<Responsable>) {
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

            const log = event.manager.create(LogAuditoria, {
                accion: 'UPDATE',
                entidad: 'responsables',
                entidadId: event.entity.id,
                detalles: changes,
                ipAddress: '127.0.0.1',
                userAgent: 'System',
            });

            await event.manager.save(log);
        } catch (error) {
            console.error('Error logging audit for Responsable update:', error);
        }
    }

    async beforeRemove(event: RemoveEvent<Responsable>) {
        try {
            if (!event.entity) return;

            const log = event.manager.create(LogAuditoria, {
                accion: 'DELETE',
                entidad: 'responsables',
                entidadId: event.entity.id,
                detalles: {
                    cedula: event.entity.cedula,
                    nombres: event.entity.nombres,
                    apellidos: event.entity.apellidos,
                },
                ipAddress: '127.0.0.1',
                userAgent: 'System',
            });

            await event.manager.save(log);
        } catch (error) {
            console.error('Error logging audit for Responsable delete:', error);
        }
    }
}
