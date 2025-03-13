import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'code/database/repository/users.repository';
import { TelegramProfilesRepository } from 'code/database/repository/telegramProfiles.repository';
import { WinstonService } from 'code/logger/winston.service';
import { Context } from 'telegraf';
import { buildInlineKeyboard, RenderPage } from 'code/common/utils';
import { PAGE_KEYS, telegramPages } from './common/telegram.menu';

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
    await this.processCheckUser(context);

    await RenderPage(context, PAGE_KEYS.MAIN_PAGE);
  }

  public async renderPage(context: Context, page: string): Promise<void> {
    const { message, buttons } = telegramPages[page];

    if (!context) {
      this.logger.error(`[TelegramService.renderPage] - Контекст отсутствует`);
      throw new Error('Контекст отсутствует');
    }

    if (!context.callbackQuery) {
      await context.reply(message, buttons && buildInlineKeyboard(buttons));
    } else {
      await context.editMessageText(
        message,
        buttons && buildInlineKeyboard(buttons),
      );
    }
  }

  private async processCheckUser(context: Context) {
    if (!('message' in context.update)) return;

    const user = context.update.message.from;
    const { id } = user;
    // Сначала ищем, есть ли Telegram профиль
    const telegramID = await this.tgProfilesRepo.getTelegramProfileById(id);

    // Если нет, добавить нового пользователя в БД и Telegram профиль
    if (!telegramID) {
      const userID = await this.usersRepo.createUser();

      // Создать профиль только в случае, если есть id пользователя
      if (userID) {
        const telegramProfile = {
          user_id: userID,
          ...user,
        };

        // Создание Telegram профиля
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
