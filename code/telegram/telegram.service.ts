import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'code/database/repository/users.repository';
import { TelegramProfilesRepository } from 'code/database/repository/telegramProfiles.repository';
import { WinstonService } from 'code/logger/winston.service';
import { Context, Markup } from 'telegraf';
import { BUTTONS } from './telegram.buttons';
import { MESSAGES } from './telegram.messages';

@Injectable()
export class TelegramService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly tgProfilesRepo: TelegramProfilesRepository,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Обрабатывает старт бота: создает пользователя и отправляет приветственное сообщение.
   * @param ctx - Контекст Telegraf
   */
  public async startBot(ctx: Context): Promise<void> {
    if ('message' in ctx.update) {
      const user = ctx.update.message.from;
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

    await ctx.reply(
      MESSAGES.WELCOME,
      Markup.keyboard([BUTTONS.MAIN_MENU]).resize(),
    );
    await this.sendMenu(ctx);
  }

  /**
   * Отправляет главное меню с кнопками.
   * @param ctx - Контекст Telegraf
   */
  public async sendMenu(ctx: Context): Promise<void> {
    await ctx.reply(
      MESSAGES.SERVER_INFO,
      Markup.inlineKeyboard([
        [Markup.button.url('💎 Купить подписку', 'https://your-vpn-link.com')],
        [Markup.button.callback('🔄 Обновить статус', 'update_status')],
        [Markup.button.url('📢 Наш канал', 'https://t.me/YouFastVPN')],
      ]),
    );
  }

  /**
   * Удаляет указанное сообщение по ID.
   * @param ctx - Контекст Telegraf с сессией
   * @param messageId - ID сообщения, которое необходимо удалить
   */
  private async deleteMessage(
    ctx: Context,
    messageId: number,
  ): Promise<boolean> {
    if (!messageId) return false;

    try {
      await ctx.deleteMessage(messageId);
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
