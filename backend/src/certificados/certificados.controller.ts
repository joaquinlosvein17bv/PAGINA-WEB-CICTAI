import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';

@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCertificadoDto) {
    const certificado = await this.certificadosService.create({
      userId: dto.userId,
      codigoPago: dto.codigoPago,
      metodoPago: dto.metodoPago,
    });

    return { message: 'Certificado confirmado con éxito', certificado };
  }
}
