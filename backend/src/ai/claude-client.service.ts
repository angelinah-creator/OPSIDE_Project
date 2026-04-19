import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeClientService {
  private readonly logger = new Logger(ClaudeClientService.name);
  private anthropic: Anthropic;
  private model: string;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
    this.model = this.configService.get<string>('AI_MODEL') || 'claude-sonnet-4-20250514';
  }

  async generateCompletion(
    systemPrompt: string,
    userMessage: string,
    temperature = 0.7,
    maxTokens = 4096,
  ): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      return (textBlock as any)?.text || '';
    } catch (error) {
      this.logger.error('Claude API error:', error);
      throw new Error('Failed to generate completion from Claude');
    }
  }
}