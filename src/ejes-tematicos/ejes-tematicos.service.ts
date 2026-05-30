import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EjeTematico } from './entities/eje-tematico.entity';

@Injectable()
export class EjesTematicosService {
  constructor(
    @InjectRepository(EjeTematico)
    private readonly ejeRepository: Repository<EjeTematico>,
  ) {}

  async findAll(): Promise<EjeTematico[]> {
    return this.ejeRepository.find({ order: { nombre: 'ASC' } });
  }

  async findById(id: string): Promise<EjeTematico | null> {
    return this.ejeRepository.findOne({ where: { id } });
  }

  async findByName(nombre: string): Promise<EjeTematico | null> {
    return this.ejeRepository.findOne({ where: { nombre } });
  }

  async create(data: Partial<EjeTematico>): Promise<EjeTematico> {
    const eje = this.ejeRepository.create(data);
    return this.ejeRepository.save(eje);
  }
}
