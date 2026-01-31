import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from './auditoria.service';

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
    constructor(private auditoriaService: AuditoriaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;

        // Solo auditar métodos que modifican datos
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle().pipe(
                tap(async (data) => {
                    try {
                        const user = req.user;
                        const url = req.url;
                        const body = req.body;
                        const ip = req.ip;
                        const userAgent = req.headers['user-agent'];

                        // Determinar entidad basada en la URL
                        // Ejemplo: /bienes/1 -> Entidad: bienes, ID: 1
                        const parts = url.split('/');
                        const entidad = parts[1] || 'unknown';
                        const entidadId = parts[2] ? parseInt(parts[2]) : (data && data.id ? data.id : null);

                        await this.auditoriaService.log(
                            user ? user.id : null,
                            method,
                            entidad,
                            entidadId,
                            body,
                            ip,
                            userAgent,
                        );
                    } catch (error) {
                        console.error('Error al registrar auditoría:', error);
                    }
                })
            );
        }

        return next.handle();
    }
}
