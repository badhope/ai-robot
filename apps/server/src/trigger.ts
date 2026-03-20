import type { ChatMessageEvent } from '@ai-robot/core';

export interface TriggerRuleConfig {
  privateAutoReply: boolean;
  groupPrefix: string;
  groupAiTrigger: 'at' | 'mention' | 'both';
}

export function shouldTriggerAI(event: ChatMessageEvent, config: TriggerRuleConfig): boolean {
  if (event.chatType === 'private') {
    return config.privateAutoReply;
  }

  if (event.chatType === 'group') {
    const text = event.text.trim();

    if (config.groupAiTrigger === 'at' || config.groupAiTrigger === 'both') {
      if (event.isAt) {
        return true;
      }
    }

    if (config.groupAiTrigger === 'mention' || config.groupAiTrigger === 'both') {
      if (text.startsWith(config.groupPrefix)) {
        return true;
      }
    }
  }

  return false;
}

export function cleanGroupMessage(text: string, config: TriggerRuleConfig): string {
  let cleaned = text.trim();

  if (cleaned.startsWith(config.groupPrefix)) {
    cleaned = cleaned.slice(config.groupPrefix.length).trim();
  }

  return cleaned;
}
