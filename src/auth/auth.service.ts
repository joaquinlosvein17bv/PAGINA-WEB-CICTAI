import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OticCodesService } from '../otic-codes/otic-codes.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ValidateOticDto } from './dto/validate-otic.dto';
import { AsistenciaDto } from './dto/asistencia.dto';
import { VerificarAsistenciaDto } from './dto/verificar-asistencia.dto';
import { RegistrarBoucherDto } from './dto/registrar-boucher.dto';
import { GoogleDriveService } from '../google-drive/google-drive.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly oticCodesService: OticCodesService,
    private readonly mailService: MailService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async register(dto: RegisterDto, voucherPath?: string) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const user = await this.usersService.create({
      nombre: dto.nombre,
      email: dto.email,
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

  async verificarAsistencia(dto: VerificarAsistenciaDto) {
    const user = await this.usersService.findByDni(dto.dni);

    if (!user) {
      return {
        asistio: false,
        message: 'No se encontró ningún registro con ese DNI.',
      };
    }

    const asistio =
      user.asistencia_jueves25_maniana ||
      user.asistencia_jueves25_tarde ||
      user.asistencia_viernes26_maniana ||
      user.asistencia_viernes26_tarde;

    if (asistio) {
      return {
        asistio: true,
        message: 'Asistencia verificada correctamente. Podés proseguir con tu certificado.',
        nombre: user.nombre,
      };
    }

    return {
      asistio: false,
      message: 'No registrás asistencia al evento. Es necesario asistir al menos a una sesión para obtener el certificado.',
    };
  }

  async registrarBoucher(
    dto: RegistrarBoucherDto,
    file?: Express.Multer.File,
  ) {
    // Si el DNI del formulario es distinto al original de verificación,
    // verificar que el nuevo DNI también tenga asistencia registrada
    if (dto.dniOriginal && dto.dni !== dto.dniOriginal) {
      const verifUser = await this.usersService.findByDni(dto.dni);
      if (!verifUser) {
        throw new BadRequestException('El DNI ingresado no está registrado en el congreso.');
      }

      const asistio =
        verifUser.asistencia_jueves25_maniana ||
        verifUser.asistencia_jueves25_tarde ||
        verifUser.asistencia_viernes26_maniana ||
        verifUser.asistencia_viernes26_tarde;

      if (!asistio) {
        throw new BadRequestException('El DNI ingresado no registra asistencia al evento. No puede obtener el certificado.');
      }
    }

    // Buscar al usuario por el DNI indicado en el formulario
    const user = await this.usersService.findByDni(dto.dni);
    if (!user) {
      throw new UnauthorizedException('No se encontró ningún usuario con ese DNI.');
    }

    // Actualizar nombre (NO se actualiza el DNI)
    user.nombre = dto.nombre;

    // Actualizar código de boucher
    user.voucherCode = dto.codigoBoucher;

    // Subir el PDF a Google Drive si se adjuntó un archivo
    if (file) {
      const nombreArchivo = `boucher_${dto.dni}_${Date.now()}.pdf`;
      const driveResult = await this.googleDriveService.uploadFile(
        file,
        nombreArchivo,
        file.mimetype || 'application/pdf',
      );
      user.voucherPath = JSON.stringify({
        fileId: driveResult.fileId,
        webViewLink: driveResult.webViewLink,
        fileName: nombreArchivo,
      });
    }

    await this.usersService.update(user);

    return {
      message: 'Boucher registrado correctamente.',
      dni: user.dni,
      nombre: user.nombre,
      voucherCode: user.voucherCode,
    };
  }

  async marcarAsistencia(dto: AsistenciaDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('El correo ingresado no está registrado en el congreso.');
    }

    // Actualizar DNI si es diferente al existente
    if (dto.dni !== user.dni) {
      user.dni = dto.dni;
    }

    // ─── Sesión fija: viernes 26 tarde ───────────────────────────────
    // Sin restricción horaria: cualquier asistencia que se registre desde
    // grabar-asistencia.html se marca como "viernes 26 tarde".
    const SESION_COLUMNA = 'asistencia_viernes26_tarde' as const;
    const SESION_LABEL = 'viernes 26 tarde (13:50 - 18:30)';

    // Verificar que no haya marcado ya esta sesión
    if ((user as any)[SESION_COLUMNA]) {
      throw new ConflictException(
        `Ya registraste tu asistencia en la sesión de ${SESION_LABEL}. No puedes registrarla dos veces.`,
      );
    }

    // Marcar la columna
    (user as any)[SESION_COLUMNA] = true;
    await this.usersService.update(user);

    return {
      message: `Asistencia registrada correctamente para la sesión de ${SESION_LABEL}.`,
      sesion: SESION_LABEL,
    };
  }
}
