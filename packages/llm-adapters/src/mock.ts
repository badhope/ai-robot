import type { LLMGenerateRequest, LLMGenerateResponse, LLMProvider } from '@ai-robot/core';
import { createLoggerWithPrefix } from '@ai-robot/logger';

const logger = createLoggerWithPrefix('MockLLMProvider');

export class MockLLMProvider implements LLMProvider {
  name = 'MockLLMProvider';
  kind = 'local' as const;

  async generate(input: LLMGenerateRequest): Promise<LLMGenerateResponse> {
    logger.info(`Generating response for ${input.messages.length} messages`);

    const lastMessage = input.messages[input.messages.length - 1];
    const userMessage = lastMessage?.content || '';

    const response: LLMGenerateResponse = {
      provider: this.name,
      model: 'mock-model',
      content: `Mock response to: ${userMessage}`,
      usage: {
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15,
      },
    };

    return response;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async listModels(): Promise<string[]> {
    return ['mock-model'];
  }
}
