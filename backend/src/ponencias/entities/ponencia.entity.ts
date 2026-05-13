import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EjeTematico } from '../../ejes-tematicos/entities/eje-tematico.entity';

@Entity('ponencias')
export class Ponencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'varchar', length: 500 })
  autores: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  afiliacion: string;

  @Column({ type: 'uuid' })
  ejeTematicoId: string;

  @ManyToOne(() => EjeTematico)
  @JoinColumn({ name: 'ejeTematicoId' })
  ejeTematico: EjeTematico;

  @Column({ type: 'varchar', length: 255 })
  correo: string;

  @Column({ type: 'varchar', length: 500 })
  palabrasClave: string;

  @Column({ type: 'text' })
  resumen: string;

  @Column({ type: 'text', nullable: true })
  referencias: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
