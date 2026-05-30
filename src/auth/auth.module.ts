import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { OticCodesModule } from '../otic-codes/otic-codes.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, OticCodesModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
