import { Context as TelegrafContext } from 'telegraf';

export interface UserSession {
  pageHistory: string[];
}

export interface Context extends TelegrafContext {
  session: UserSession;
}
