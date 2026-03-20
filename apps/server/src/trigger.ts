import type { ChatMessageEvent } from '@ai-robot/core';

export interface TriggerConfig {
  privateAutoReply: boolean;
  groupPrefix: string;
  groupAiTrigger: 'at' | 'mention' | 'both';
}

export function shouldTriggerAI(event: ChatMessageEvent, config: TriggerConfig): boolean {
  if (event.chatType === 'private') {
    return config.privateAutoReply;
  }

  if (event.chatType === 'group') {
    const trigger = config.groupAiTrigger;
    
    if (trigger === 'at' && event.isAt) {
      return true;
    }
    
    if (trigger === 'mention' && event.mentions && event.mentions.length > 0) {
      return true;
    }
    
    if (trigger === 'both' && event.isAt) {
      return true;
    }

    if (event.text.startsWith(config.groupPrefix)) {
      return true;
    }
  }

  return false;
}

export function cleanGroupMessage(text: string, config: TriggerConfig): string {
  let cleaned = text;
  
  if (cleaned.startsWith(config.groupPrefix)) {
    cleaned = cleaned.slice(config.groupPrefix.length).trim();
  }

  cleaned = cleaned.replace(/@\[.*?\]\(.*?\)/g, '').trim();

  return cleaned;
}
