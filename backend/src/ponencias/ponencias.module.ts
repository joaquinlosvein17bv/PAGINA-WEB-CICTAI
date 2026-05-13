import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ponencia } from './entities/ponencia.entity';
import { PonenciasService } from './ponencias.service';
import { PonenciasController } from './ponencias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ponencia])],
  controllers: [PonenciasController],
  providers: [PonenciasService],
  exports: [PonenciasService],
})
export class PonenciasModule {}
