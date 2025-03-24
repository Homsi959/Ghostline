import { Injectable } from '@nestjs/common';
import { Context, TelegramSession } from '../common/telegram.types';

/**
 * Сервис для управления историей посещенных страниц в течение сессии пользователя.
 */
@Injectable()
export class TelegramHistoryService {
  /**
   * Сохраняет текущую страницу в историю сессии пользователя,
   * если она не совпадает с последней посещенной страницей.
   *
   * @param history - Массив с историей посещенных страниц.
   * @param page - Текущая страница, которая будет сохранена в истории.
   */
  savePageHistory(history: TelegramSession['pageHistory'], page: string) {
    const prevPage = history[history.length - 1];

    if (history.length == 0 || prevPage !== page) {
      history.push(page);
    }
  }

  /**
   * Извлекает предыдущую страницу из истории страниц в сессии.
   *
   * @param {Context} context - Контекст, содержащий сессию с историей страниц.
   * @returns {string | null} - URL или идентификатор предыдущей страницы,
   * или null, если предыдущей страницы нет.
   */
  getPreviousPage(context: Context): string | null {
    const history = context?.session.pageHistory;

    if (!Array.isArray(history) || history.length < 2) {
      return null;
    }

    history.pop();
    return history[history.length - 1] ?? null;
  }
}
