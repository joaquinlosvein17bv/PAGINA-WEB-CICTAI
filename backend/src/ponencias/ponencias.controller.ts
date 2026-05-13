import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { PonenciasService } from './ponencias.service';
import { CreatePonenciaDto } from './dto/create-ponencia.dto';

@Controller('ponencias')
export class PonenciasController {
  constructor(private readonly ponenciasService: PonenciasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePonenciaDto) {
    const ponencia = await this.ponenciasService.create({
      userId: dto.userId,
      titulo: dto.titulo,
      autores: dto.autores,
      afiliacion: dto.afiliacion,
      ejeTematicoId: dto.ejeTematicoId,
      correo: dto.correo,
      palabrasClave: dto.palabrasClave,
      resumen: dto.resumen,
      referencias: dto.referencias,
    });

    return { message: 'Ponencia registrada con éxito', ponencia };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('ejeId') ejeId?: string) {
    const ponencias = ejeId
      ? await this.ponenciasService.findByEje(ejeId)
      : await this.ponenciasService.findAll();

    return { ponencias };
  }
}
