import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ValidateOticDto {
  @IsString()
  @IsNotEmpty({ message: 'El código OTIC es obligatorio' })
  codigo: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email?: string;
}
