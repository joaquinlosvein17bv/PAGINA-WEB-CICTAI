import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  dni: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  participacion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  universidad: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  voucherCode: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  voucherPath: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigoOtic: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  modalidad: string;

  @Column({ type: 'text', nullable: true })
  hojaDeVida: string;

  @Column({ type: 'boolean', default: false })
  asistencia_jueves25_maniana: boolean;

  @Column({ type: 'boolean', default: false })
  asistencia_jueves25_tarde: boolean;

  @Column({ type: 'boolean', default: false })
  asistencia_viernes26_maniana: boolean;

  @Column({ type: 'boolean', default: false })
  asistencia_viernes26_tarde: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
