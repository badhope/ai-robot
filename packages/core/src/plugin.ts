import type { ChatMessageEvent } from './im.js';

export interface PluginContext {
  event: ChatMessageEvent;
}

export interface Plugin {
  name: string;
  onMessage?(ctx: PluginContext): Promise<void>;
}
