import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from './entities/certificado.entity';

@Injectable()
export class CertificadosService {
  constructor(
    @InjectRepository(Certificado)
    private readonly certificadoRepository: Repository<Certificado>,
  ) {}

  async create(data: Partial<Certificado>): Promise<Certificado> {
    const certificado = this.certificadoRepository.create(data);
    return this.certificadoRepository.save(certificado);
  }

  async findByUser(userId: string): Promise<Certificado[]> {
    return this.certificadoRepository.find({ where: { userId } });
  }
}
