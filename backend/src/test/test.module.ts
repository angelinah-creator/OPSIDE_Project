import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { ClaudeClientService } from '../ai/claude-client.service';

@Module({
  controllers: [TestController],
  providers: [TestService, ClaudeClientService],
  exports: [TestService],
})
export class TestModule {}