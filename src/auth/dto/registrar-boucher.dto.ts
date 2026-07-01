import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RegistrarBoucherDto {
  @IsString()
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos numéricos' })
  dni: string;

  @IsString()
  @IsOptional()
  dniOriginal?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(255, { message: 'El nombre es demasiado largo' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de boucher es obligatorio' })
  codigoBoucher: string;

  @IsString()
  @IsOptional()
  filePath?: string;
}
