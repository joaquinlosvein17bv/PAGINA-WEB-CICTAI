import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMatriculaDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de pago es obligatorio' })
  codigoPago: string;

  @IsString()
  @IsNotEmpty({ message: 'El método de pago es obligatorio' })
  metodoPago: string;
}
