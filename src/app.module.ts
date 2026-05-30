import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { OticCodesModule } from './otic-codes/otic-codes.module';
import { EjesTematicosModule } from './ejes-tematicos/ejes-tematicos.module';
import { PonenciasModule } from './ponencias/ponencias.module';
import { CertificadosModule } from './certificados/certificados.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(__dirname, '..', '.env') }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/auth/(.*)', '/ponencias/(.*)', '/ejes-tematicos/(.*)', '/certificados/(.*)'],
    }),
    UsersModule,
    AuthModule,
    OticCodesModule,
    EjesTematicosModule,
    PonenciasModule,
    CertificadosModule,
  ],
})
export class AppModule {}
