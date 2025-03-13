import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'code/database/repository/users.repository';
import { TelegramProfilesRepository } from 'code/database/repository/telegramProfiles.repository';
import { WinstonService } from 'code/logger/winston.service';
import { addGoBackButton, buildInlineKeyboard } from 'code/common/utils';
import { PAGE_KEYS, telegramPages } from './common/telegram.pages';
import { Context } from 'code/common/types';

/**
 * Сервис для работы с Telegram-ботом.
 * Обрабатывает запросы от пользователей, управляет рендерингом страниц, сохраняет историю страниц в сессии, а также управляет данными пользователей.
 */
@Injectable()
export class TelegramService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly tgProfilesRepo: TelegramProfilesRepository,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Обрабатывает старт бота: создает пользователя и отправляет приветственное сообщение.
   * @param context - Контекст Telegraf
   */
  async startBot(context: Context): Promise<void> {
    await this.ensureUserExists(context);

    await this.renderPage(context, PAGE_KEYS.MAIN_PAGE);
  }

  /**
   * Отображает указанную страницу в чате.
   * Если метод вызывается не через callback, отправляет новое сообщение.
   * В противном случае изменяет текст существующего сообщения.
   *
   * @param context - Контекст Telegraf, содержащий информацию о чате и пользователе.
   * @param page - Ключ страницы, которую нужно отобразить.
   * @throws Ошибку, если контекст отсутствует.
   */
  async renderPage(context: Context, page: string): Promise<void> {
    const { message, keyboardConfig, goBackButton } = telegramPages[page];
    let buttons = keyboardConfig
      ? buildInlineKeyboard(keyboardConfig.buttons, keyboardConfig.columns)
      : undefined;

    if (!context) {
      this.logger.error(`[TelegramService.renderPage] - Контекст отсутствует`);
      throw new Error('Контекст отсутствует');
    }

    if (goBackButton) {
      buttons = addGoBackButton(buttons);
    }

    if (!context.callbackQuery) {
      // Отправляем новое сообщение, если метод вызван не через callback
      await context.reply(message, buttons);
    } else {
      // Изменяем существующее сообщение, если метод вызван через callback
      await context.editMessageText(message, buttons);
    }

    this.savePageHistory(context, page);
  }

  /**
   * Проверяет, существует ли Telegram-профиль пользователя в БД.
   * Если профиль отсутствует, создаёт нового пользователя и Telegram-профиль.
   *
   * @param context - Контекст Telegraf, содержащий информацию о пользователе.
   */
  private async ensureUserExists(context: Context): Promise<void> {
    if (!('message' in context.update)) return;

    const user = context.update.message.from;
    const { id } = user;

    // Проверяем, существует ли Telegram-профиль пользователя в БД
    const telegramID = await this.tgProfilesRepo.getTelegramProfileById(id);

    // Если профиль отсутствует, создаём нового пользователя
    if (!telegramID) {
      const userID = await this.usersRepo.createUser();

      // Создаём Telegram-профиль только если удалось создать пользователя
      if (userID) {
        const telegramProfile = {
          user_id: userID,
          ...user,
        };

        await this.tgProfilesRepo.createTelegramProfile(telegramProfile);
      }
    }
  }

  /**
   * Сохраняет историю страниц в сессии.
   *
   * @param context - Объект контекста, содержащий данные callback-запроса.
   * @param page - Страница для сохранения в истории.
   */
  private savePageHistory(context: Context, page: string) {
    context.session ??= { pageHistory: [] }; // Если session = undefined, инициализируем его
    context.session.pageHistory ??= []; // Если pageHistory = undefined, создаём массив

    context.session.pageHistory.push(page);
  }

  /**
   * Отображает предыдущую страницу из истории сессии.
   * Если история пуста или в ней только одна страница, то ничего не происходит.
   *
   * @param context - Объект контекста, содержащий данные callback-запроса.
   */
  async goBackRender(context: Context) {
    const history = context.session.pageHistory;

    if (history.length < 2) {
      this.logger.error(
        `[TelegramService.goBackRender] - История страниц пуста или содержит только одну страницу`,
      );
      return;
    }

    const prevPage = history[history.length - 2];

    await this.renderPage(context, prevPage);
  }

  /**
   * Удаляет указанное сообщение по ID.
   * @param context - Контекст Telegraf с сессией
   * @param messageId - ID сообщения, которое необходимо удалить
   */
  private async deleteMessage(
    context: Context,
    messageId: number,
  ): Promise<boolean> {
    if (!messageId) return false;

    try {
      await context.deleteMessage(messageId);
      this.logger.log(
        `[TelegramService.deleteMessage] - Удалено сообщение с ID: ${messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `[TelegramService.deleteMessage] - Не удалось удалить сообщение с ID: ${messageId}`,
        error,
      );
      return false;
    }
  }
}
