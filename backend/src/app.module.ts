import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CandidateModule } from './candidate/candidate.module';
import { ClientModule } from './client/client.module';
import { SkillsModule } from './skills/skills.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { TestModule } from './test/test.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnvironment } from './config/validate-environment';
import { VideosModule } from './videos/videos.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { MatchesModule } from './matches/matches.module';
import { CustomTestModule } from './custom-test/custom-test.module';

validateEnvironment();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL_MS || 60000),
        limit: Number(process.env.THROTTLE_LIMIT || 100),
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CandidateModule,
    ClientModule,
    SkillsModule,
    UploadModule,
    MailModule,
    TestModule,
    VideosModule,
    JobOffersModule,
    NotificationsModule,
    CandidaturesModule,
    MatchesModule,
    CustomTestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
