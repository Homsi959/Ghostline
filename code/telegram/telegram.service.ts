import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'code/database/repository/users.repository';
import { TelegramProfilesRepository } from 'code/database/repository/telegramProfiles.repository';
import { WinstonService } from 'code/logger/winston.service';
import { Context } from 'telegraf';
import { buildInlineKeyboard } from 'code/common/utils';
import { PAGE_KEYS, telegramPages } from './common/telegram.pages';

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
  public async startBot(context: Context): Promise<void> {
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
  public async renderPage(context: Context, page: string): Promise<void> {
    const { message, keyboardConfig } = telegramPages[page];

    if (!context) {
      this.logger.error(`[TelegramService.renderPage] - Контекст отсутствует`);
      throw new Error('Контекст отсутствует');
    }

    const options = keyboardConfig
      ? buildInlineKeyboard(keyboardConfig.buttons, keyboardConfig.columns)
      : undefined;

    if (!context.callbackQuery) {
      // Отправляем новое сообщение, если метод вызван не через callback
      await context.reply(message, options);
    } else {
      // Изменяем существующее сообщение, если метод вызван через callback
      await context.editMessageText(message, options);
    }
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
