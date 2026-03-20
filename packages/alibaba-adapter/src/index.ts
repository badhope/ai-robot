import axios, { AxiosError } from 'axios';
import type { LLMProvider, LLMGenerateRequest, LLMGenerateResponse } from '@ai-robot/core';
import { logger } from '@ai-robot/logger';

export interface AlibabaProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
}

export interface AlibabaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AlibabaProvider implements LLMProvider {
  public name: string;
  public kind: 'remote' = 'remote';
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private timeout: number;

  constructor(config: AlibabaProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    this.model = config.model || 'qwen-plus';
    this.timeout = config.timeout || 120000;
    this.name = `alibaba-${this.model}`;
  }

  async generate(input: LLMGenerateRequest): Promise<LLMGenerateResponse> {
    if (!this.apiKey) {
      throw new Error('ALIBABA_API_KEY is not configured');
    }

    const messages: AlibabaMessage[] = [];

    if (input.systemPrompt) {
      messages.push({ role: 'system', content: input.systemPrompt });
    }

    for (const msg of input.messages) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: input.model || this.model,
          messages,
          temperature: input.temperature ?? 0.7,
          max_tokens: input.maxTokens ?? 2048,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: this.timeout,
        }
      );

      const data = response.data;

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from Alibaba API');
      }

      return {
        provider: 'alibaba',
        model: input.model || this.model,
        content: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        raw: data,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          if (status === 401 || status === 403) {
            logger.error('[Alibaba] Authentication failed - check API key');
            throw new Error('阿里云 API 密钥无效，请检查配置');
          }

          if (status === 400) {
            const errorMsg = data?.error?.message || data?.message || 'Unknown error';
            logger.error(`[Alibaba] Bad request: ${errorMsg}`);
            throw new Error(`请求错误: ${errorMsg}`);
          }

          if (status === 429) {
            logger.error('[Alibaba] Rate limit exceeded');
            throw new Error('请求频率超限，请稍后再试');
          }

          if (status >= 500) {
            logger.error('[Alibaba] Server error');
            throw new Error('阿里云服务暂时不可用，请稍后再试');
          }

          throw new Error(`API 请求失败 (${status}): ${data?.error?.message || data?.message || 'Unknown error'}`);
        }

        if (error.code === 'ECONNABORTED') {
          logger.error('[Alibaba] Request timeout');
          throw new Error('请求超时，请检查网络或降低超时设置');
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          logger.error('[Alibaba] Cannot connect to API');
          throw new Error('无法连接到阿里云 API，请检查网络');
        }
      }

      logger.error(`[Alibaba] Generate error: ${error}`);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 10000,
        }
      );

      return response.status === 200;
    } catch (error) {
      logger.warn(`[Alibaba] Health check failed: ${error}`);
      return false;
    }
  }

  async listModels?(): Promise<string[]> {
    return [
      'qwen-plus',
      'qwen-plus-v2',
      'qwen-turbo',
      'qwen-long',
      'qwen-max',
      'qwen-max-longcontext',
    ];
  }
}
