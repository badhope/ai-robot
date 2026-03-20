import type { ChatMessageEvent } from '@ai-robot/core';

export interface CommandContext {
  sessionId: string;
  clearSession: (sessionId: string) => Promise<void>;
  sendReply: (text: string) => Promise<void>;
}

export interface CommandResult {
  handled: boolean;
  response?: string;
}

const HELP_TEXT = `AI 助手使用方法：

群聊：
  @机器人 你好
  /ai 你好

命令：
  /ai help - 显示此帮助
  /ai clear - 清空当前会话

私聊直接发送消息即可。`;

export async function handleCommand(
  _event: ChatMessageEvent,
  context: CommandContext
): Promise<CommandResult> {
  const text = _event.text.trim();

  if (text === '/ai help' || text === '/ai help@' || text === '/ai help ') {
    return {
      handled: true,
      response: HELP_TEXT,
    };
  }

  if (text === '/ai clear' || text === '/ai clear@' || text === '/ai clear ') {
    await context.clearSession(context.sessionId);
    return {
      handled: true,
      response: '当前会话已清空。',
    };
  }

  return { handled: false };
}

export function isCommand(text: string): boolean {
  return text.startsWith('/ai ');
}
