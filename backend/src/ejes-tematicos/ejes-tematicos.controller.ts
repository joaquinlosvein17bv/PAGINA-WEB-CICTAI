import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { EjesTematicosService } from './ejes-tematicos.service';

@Controller('ejes-tematicos')
export class EjesTematicosController {
  constructor(private readonly ejesTematicosService: EjesTematicosService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const ejes = await this.ejesTematicosService.findAll();
    return { ejes };
  }
}
