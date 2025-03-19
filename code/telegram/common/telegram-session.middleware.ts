import { Context } from 'code/common/types';

/**
 * Значения по умолчанию для сессии Telegram.
 */
const defaultTelegramSession = {
  pageHistory: [],
  // Добавь сюда другие поля сессии по необходимости
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
