import { Context as TelegrafContext } from 'telegraf';

/**
 * Интерфейс для сессии пользователя, содержащий историю страниц.
 */
export interface UserSession {
  pageHistory: string[];
}

/**
 * Расширенный интерфейс контекста Telegraf, добавляющий типизацию для сессии пользователя.
 */
export interface Context extends TelegrafContext {
  session: UserSession;
}
