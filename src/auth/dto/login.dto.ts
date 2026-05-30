import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de comprobante es obligatorio' })
  voucherCode: string;
}
