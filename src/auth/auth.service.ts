import {
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
      universidad: dto.universidad,
      voucherCode: dto.voucherCode,
      codigoOtic: dto.codigoOtic,
      modalidad: dto.modalidad,
      hojaDeVida: dto.hojaDeVida,
      voucherPath,
    });

    if (dto.codigoOtic) {
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
}
