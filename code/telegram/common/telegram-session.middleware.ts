import { Context, TelegramSession } from './telegram.types';

/**
 * Значения по умолчанию для сессии Telegram.
 */
export const defaultTelegramSession: TelegramSession = {
  pageHistory: [],
  payload: {
    vlessLink: undefined,
  },
};

/**
 * Middleware для инициализации сессии.
 * Если сессия отсутствует, создается объект с дефолтными значениями.
 */
export function initializeTelegramSession(
  context: Context,
  next: () => Promise<void> | void,
) {
  if (!context.session) {
    context.session = { ...defaultTelegramSession };
  }
  return next();
}
