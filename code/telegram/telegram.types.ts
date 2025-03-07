import { Context } from 'telegraf';

export interface BotSession extends Context {
  session: {
    lastMessageId?: number;
  };
}
