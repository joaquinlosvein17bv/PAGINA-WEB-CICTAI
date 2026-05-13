import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ponencia } from './entities/ponencia.entity';

@Injectable()
export class PonenciasService {
  constructor(
    @InjectRepository(Ponencia)
    private readonly ponenciaRepository: Repository<Ponencia>,
  ) {}

  async create(data: Partial<Ponencia>): Promise<Ponencia> {
    const ponencia = this.ponenciaRepository.create(data);
    return this.ponenciaRepository.save(ponencia);
  }

  async findAll(): Promise<Ponencia[]> {
    return this.ponenciaRepository.find({
      relations: ['ejeTematico', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEje(ejeTematicoId: string): Promise<Ponencia[]> {
    return this.ponenciaRepository.find({
      where: { ejeTematicoId },
      relations: ['ejeTematico', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Ponencia[]> {
    return this.ponenciaRepository.find({
      where: { userId },
      relations: ['ejeTematico'],
    });
  }
}
