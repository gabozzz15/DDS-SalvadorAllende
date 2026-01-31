import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResponsablesModule } from './responsables/responsables.module';
import { UnidadesAdministrativasModule } from './unidades-administrativas/unidades-administrativas.module';
import { CategoriasSudebipModule } from './categorias-sudebip/categorias-sudebip.module';
import { TiposOrigenModule } from './tipos-origen/tipos-origen.module';
import { BienesModule } from './bienes/bienes.module';
import { TransferenciasModule } from './transferencias/transferencias.module';
import { DesincorporacionesModule } from './desincorporaciones/desincorporaciones.module';
import { FotosModule } from './fotos/fotos.module';
import { AlertasModule } from './alertas/alertas.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuditoriaInterceptor } from './auditoria/auditoria.interceptor';
import { ReportesModule } from './reportes/reportes.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
        synchronize: false, // IMPORTANTE: false en producción
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    ResponsablesModule,
    UnidadesAdministrativasModule,
    TiposOrigenModule,
    CategoriasSudebipModule,
    BienesModule,
    TransferenciasModule,
    DesincorporacionesModule,
    FotosModule,
    AlertasModule,
    AuditoriaModule,
    ReportesModule,
    SubscribersModule,
    AsignacionesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditoriaInterceptor,
    },
  ],
})
export class AppModule { }
