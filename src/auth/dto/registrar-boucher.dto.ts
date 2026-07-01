import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RegistrarBoucherDto {
  @IsString()
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  dniActual: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'El nuevo DNI debe tener exactamente 8 dígitos numéricos' })
  nuevoDni?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(255, { message: 'El nombre es demasiado largo' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de boucher es obligatorio' })
  codigoBoucher: string;
}
