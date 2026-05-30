import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePonenciaDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'Los autores son obligatorios' })
  autores: string;

  @IsString()
  @IsOptional()
  afiliacion?: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El eje temático es obligatorio' })
  ejeTematicoId: string;

  @IsString()
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'Las palabras claves son obligatorias' })
  palabrasClave: string;

  @IsString()
  @IsNotEmpty({ message: 'El resumen es obligatorio' })
  resumen: string;

  @IsString()
  @IsOptional()
  referencias?: string;
}
