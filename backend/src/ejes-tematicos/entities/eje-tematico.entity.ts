import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ejes_tematicos')
export class EjeTematico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  icono: string;
}
