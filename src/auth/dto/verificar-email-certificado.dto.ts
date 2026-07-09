import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerificarEmailCertificadoDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;
}
