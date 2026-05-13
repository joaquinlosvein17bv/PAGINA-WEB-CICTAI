import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matricula } from './entities/matricula.entity';

@Injectable()
export class MatriculasService {
  constructor(
    @InjectRepository(Matricula)
    private readonly matriculaRepository: Repository<Matricula>,
  ) {}

  async create(data: Partial<Matricula>): Promise<Matricula> {
    const matricula = this.matriculaRepository.create(data);
    return this.matriculaRepository.save(matricula);
  }

  async findByUser(userId: string): Promise<Matricula[]> {
    return this.matriculaRepository.find({ where: { userId } });
  }
}
