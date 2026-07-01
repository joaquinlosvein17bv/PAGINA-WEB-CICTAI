import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const uploadsDir = process.env.VERCEL
  ? '/tmp/uploads'
  : join(process.cwd(), 'uploads');
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ValidateOticDto } from './dto/validate-otic.dto';
import { AsistenciaDto } from './dto/asistencia.dto';
import { VerificarAsistenciaDto } from './dto/verificar-asistencia.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('voucher', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = await this.authService.register(dto, file?.path);

    return {
      message: 'Registro exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        participacion: user.participacion,
        createdAt: user.createdAt,
      },
    };
  }

  @Post('validate-otic')
  @HttpCode(HttpStatus.OK)
  async validateOtic(@Body() dto: ValidateOticDto) {
    return this.authService.validateOtic(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('asistencia')
  @HttpCode(HttpStatus.OK)
  async marcarAsistencia(@Body() dto: AsistenciaDto) {
    return this.authService.marcarAsistencia(dto);
  }

  @Post('verificar-asistencia')
  @HttpCode(HttpStatus.OK)
  async verificarAsistencia(@Body() dto: VerificarAsistenciaDto) {
    return this.authService.verificarAsistencia(dto);
  }
}
