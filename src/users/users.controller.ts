import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { PonenciasService } from '../ponencias/ponencias.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ponenciasService: PonenciasService,
  ) {}

  @Get('reporte')
  @HttpCode(HttpStatus.OK)
  async getReporte() {
    const users = await this.usersService.findAll();
    const cargoMap: Record<string, string> = {
      general: 'Estudiante',
      panelista: 'Estudiante',
      ponente: 'Docente',
    };

    const result: Array<{
      nombres: string;
      dni: string;
      correo: string;
      resolucion: string;
      horas: string;
      cargo: string;
      tipoParticipacion: string;
      tematica: string;
      tituloPonencia: string;
      resumenPonencia: string;
      codigoBoucher: string;
      boucherPdf: string;
    }> = [];

    for (const user of users) {
      // Filtro: general solo si tiene boucher PDF; ponentes/panelistas siempre
      if (user.participacion === 'general' && !user.voucherPath) {
        continue;
      }

      // Obtener temática, título y resumen para ponentes y panelistas
      let tematica = '';
      let tituloPonencia = '';
      let resumenPonencia = '';
      if (user.participacion === 'ponente' || user.participacion === 'panelista') {
        const ponencias = await this.ponenciasService.findByUser(user.id);
        tematica = ponencias
          .map((p) => p.ejeTematico?.nombre || '')
          .filter(Boolean)
          .join(', ');
        tituloPonencia = ponencias
          .map((p) => p.titulo || '')
          .filter(Boolean)
          .join(' | ');
        resumenPonencia = ponencias
          .map((p) => p.resumen || '')
          .filter(Boolean)
          .join(' | ');
      }

      result.push({
        nombres: user.nombre,
        dni: user.dni || '',
        correo: user.email,
        resolucion: '',
        horas: '',
        cargo: cargoMap[user.participacion] || '',
        tipoParticipacion: user.participacion || '',
        tematica,
        tituloPonencia,
        resumenPonencia,
        codigoBoucher: user.voucherCode || '',
        boucherPdf: user.voucherPath || '',
      });
    }

    return result;
  }
}
