import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OticCode } from './entities/otic-code.entity';

@Injectable()
export class OticCodesService {
  constructor(
    @InjectRepository(OticCode)
    private readonly oticCodeRepository: Repository<OticCode>,
  ) {}

  async validate(codigo: string): Promise<OticCode> {
    const record = await this.oticCodeRepository.findOne({ where: { codigo } });
    if (!record) {
      throw new NotFoundException('El código OTIC no existe');
    }
    if (record.usado) {
      throw new ConflictException('El código OTIC ya fue usado');
    }
    return record;
  }

  async markAsUsed(codigo: string): Promise<OticCode> {
    const record = await this.oticCodeRepository.findOne({ where: { codigo } });
    if (!record) {
      throw new NotFoundException('El código OTIC no existe');
    }
    record.usado = true;
    return this.oticCodeRepository.save(record);
  }

  async create(codigo: string): Promise<OticCode> {
    const record = this.oticCodeRepository.create({ codigo });
    return this.oticCodeRepository.save(record);
  }
}
