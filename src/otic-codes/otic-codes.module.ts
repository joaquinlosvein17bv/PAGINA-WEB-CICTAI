import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OticCode } from './entities/otic-code.entity';
import { OticCodesService } from './otic-codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([OticCode])],
  providers: [OticCodesService],
  exports: [OticCodesService],
})
export class OticCodesModule {}
