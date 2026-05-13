import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MatriculasService } from './matriculas.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

@Controller('matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMatriculaDto) {
    const matricula = await this.matriculasService.create({
      userId: dto.userId,
      codigoPago: dto.codigoPago,
      metodoPago: dto.metodoPago,
    });

    return { message: 'Matrícula confirmada con éxito', matricula };
  }
}
