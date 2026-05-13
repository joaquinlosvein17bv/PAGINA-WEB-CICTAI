import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjeTematico } from './entities/eje-tematico.entity';
import { EjesTematicosService } from './ejes-tematicos.service';
import { EjesTematicosController } from './ejes-tematicos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EjeTematico])],
  controllers: [EjesTematicosController],
  providers: [EjesTematicosService],
  exports: [EjesTematicosService],
})
export class EjesTematicosModule {}
