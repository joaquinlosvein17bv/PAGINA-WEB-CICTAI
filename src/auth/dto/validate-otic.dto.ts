import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateOticDto {
  @IsString()
  @IsNotEmpty({ message: 'El código OTIC es obligatorio' })
  codigo: string;
}
