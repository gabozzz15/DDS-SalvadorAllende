import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message: 'API funcionando correctamente',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        bienes: '/api/bienes',
        transferencias: '/api/transferencias',
        desincorporaciones: '/api/desincorporaciones',
        alertas: '/api/alertas',
        auditoria: '/api/auditoria',
      },
    };
  }
}
