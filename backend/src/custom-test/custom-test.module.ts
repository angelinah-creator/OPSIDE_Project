import { Module } from '@nestjs/common';
import { CustomTestController } from './custom-test.controller';
import { CustomTestService } from './custom-test.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, NotificationsModule, MailModule],
  controllers: [CustomTestController],
  providers: [CustomTestService],
  exports: [CustomTestService],
})
export class CustomTestModule {}
