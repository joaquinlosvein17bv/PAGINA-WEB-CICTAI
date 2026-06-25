import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { OticCodesService } from '../otic-codes/otic-codes.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ValidateOticDto } from './dto/validate-otic.dto';
import { AsistenciaDto } from './dto/asistencia.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly oticCodesService: OticCodesService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto, voucherPath?: string) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hashedPassword,
      participacion: dto.participacion,
      dni: dto.dni,
      universidad: dto.universidad,
      voucherCode: dto.voucherCode,
      codigoOtic: dto.codigoOtic,
      modalidad: dto.modalidad,
      hojaDeVida: dto.hojaDeVida,
      voucherPath,
    });

    if (dto.codigoOtic) {
      const record = await this.oticCodesService.validate(dto.codigoOtic);
      if (record.email && record.email !== dto.email) {
        throw new BadRequestException('Este código OTIC no está asignado a tu correo. Verifica que el código ingresado corresponda al correo registrado.');
      }
      await this.oticCodesService.markAsUsed(dto.codigoOtic);
    }

    if (dto.voucherCode) {
      await this.mailService.sendVoucherEmail(dto.email, dto.nombre, dto.voucherCode);
    }

    return user;
  }

  async validateOtic(dto: ValidateOticDto) {
    const record = await this.oticCodesService.validate(dto.codigo);
    return { message: 'Código OTIC validado con éxito', codigo: record.codigo };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      message: 'Validación exitosa',
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          participacion: user.participacion,
          modalidad: user.modalidad,
        },
    };
  }

  async marcarAsistencia(dto: AsistenciaDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('El correo ingresado no está registrado en el congreso.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('La contraseña ingresada no es correcta.');
    }

    // ─── Hora Perú (UTC-5) usando Intl ───────────────────────────────
    // Intl.DateTimeFormat con timeZone: 'America/Lima' funciona
    // correctamente en cualquier servidor, sin importar su timezone local
    const ahora = new Date();
    const tzPeru = 'America/Lima';

    // Extraer componentes de fecha/hora en Perú de forma confiable
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: tzPeru,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(ahora);

    const getPart = (type: string): number =>
      parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

    const anio = getPart('year');
    const mes = getPart('month');       // 1-12
    const dia = getPart('day');          // 1-31
    const horas = getPart('hour');      // 0-23
    const minutos = getPart('minute');   // 0-59
    const minutosDelDia = horas * 60 + minutos;

    // ─── Auxiliar para formatear fecha/hora legible ─────────────────
    const fechaPeru = ahora.toLocaleDateString('es-PE', {
      timeZone: tzPeru,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const horaPeru = ahora.toLocaleTimeString('es-PE', {
      timeZone: tzPeru,
      hour: '2-digit',
      minute: '2-digit',
    });

    // ─── Sesiones del congreso ──────────────────────────────────────
    // Jueves 25:  08:30-13:10 (510-790)  |  14:00-17:40 (840-1060)
    // Viernes 26: 08:30-12:30 (510-750)  |  14:00-18:30 (840-1110)
    const sesiones: { columna: keyof typeof user; activo: boolean; label: string }[] = [
      {
        columna: 'asistencia_jueves25_maniana' as any,
        activo: anio === 2026 && mes === 6 && dia === 25 && minutosDelDia >= 510 && minutosDelDia <= 790,
        label: 'jueves 25 mañana (08:30 - 13:10)',
      },
      {
        columna: 'asistencia_jueves25_tarde' as any,
        activo: anio === 2026 && mes === 6 && dia === 25 && minutosDelDia >= 840 && minutosDelDia <= 1060,
        label: 'jueves 25 tarde (14:00 - 17:40)',
      },
      {
        columna: 'asistencia_viernes26_maniana' as any,
        activo: anio === 2026 && mes === 6 && dia === 26 && minutosDelDia >= 510 && minutosDelDia <= 750,
        label: 'viernes 26 mañana (08:30 - 12:30)',
      },
      {
        columna: 'asistencia_viernes26_tarde' as any,
        activo: anio === 2026 && mes === 6 && dia === 26 && minutosDelDia >= 840 && minutosDelDia <= 1110,
        label: 'viernes 26 tarde (14:00 - 18:30)',
      },
    ];

    const sesionActual = sesiones.find((s) => s.activo);

    if (!sesionActual) {
      let horariosMsg: string;
      if (anio === 2026 && mes === 6 && dia === 25) {
        horariosMsg = 'Hoy (jueves 25) los horarios son: 08:30-13:10 y 14:00-17:40.';
      } else if (anio === 2026 && mes === 6 && dia === 26) {
        horariosMsg = 'Hoy (viernes 26) los horarios son: 08:30-12:30 y 14:00-18:30.';
      } else {
        horariosMsg = 'El congreso se realiza el 25 y 26 de junio de 2026.';
      }
      throw new BadRequestException(
        `No hay una sesión activa en este momento. Son las ${horaPeru} del ${fechaPeru}. ${horariosMsg}`,
      );
    }

    // Verificar que no haya marcado ya esta sesión
    if ((user as any)[sesionActual.columna]) {
      throw new ConflictException(
        `Ya registraste tu asistencia en la sesión de ${sesionActual.label}. No puedes registrarla dos veces.`,
      );
    }

    // Marcar la columna correspondiente
    (user as any)[sesionActual.columna] = true;
    await this.usersService.update(user);

    return {
      message: `Asistencia registrada correctamente para la sesión de ${sesionActual.label}.`,
      sesion: sesionActual.label,
      horaPeru: ahora.toLocaleString('es-PE', { timeZone: tzPeru }),
    };
  }
}
