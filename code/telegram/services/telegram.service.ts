import { Injectable } from '@nestjs/common';
import { UsersDao } from 'code/database/dao/users.dao';
import { TelegramProfilesDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { addGoBackButton, buildInlineKeyboard } from 'code/common/utils';
import { PAGE_KEYS, telegramPages } from '../common/telegram.pages';
import { TelegramHistoryService } from './telegram.history.service';
import { Context } from '../common/telegram.types';
import { SaveTelegramProfile } from 'code/database/common/types';

@Injectable()
export class TelegramService {
  constructor(
    private readonly usersDao: UsersDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
    private readonly historyService: TelegramHistoryService,
    private readonly logger: WinstonService,
  ) {}

  async startBot(context: Context): Promise<void> {
    const { from } = context;

    this.logger.log(
      `Бот запущен пользователем Telegram-профиля с ID: ${from?.id}`,
      this,
    );

    if (from) {
      const sessionFrom: Omit<SaveTelegramProfile, 'userId'> = {
        isBot: from.is_bot,
        telegramId: from.id,
        languageCode: from.language_code,
      };

      context.session.from = sessionFrom;
      await this.ensureUserExists(sessionFrom);
    }

    await this.renderPage(context, PAGE_KEYS.MAIN_PAGE);
  }

  async renderPage(context: Context, pageKey: string): Promise<void> {
    if (!context) {
      this.logger.error('Контекст отсутствует', this);
      throw new Error('Контекст отсутствует');
    }

    const { message, keyboardConfig, goBackButton } = telegramPages[pageKey];
    let buttons = keyboardConfig
      ? buildInlineKeyboard(keyboardConfig.buttons, keyboardConfig.columns)
      : undefined;

    if (goBackButton) {
      buttons = addGoBackButton(buttons);
    }

    if (context.callbackQuery) {
      await context.editMessageText(message, buttons);
      this.logger.log(`Изменено сообщение: ${pageKey}`, this);
    } else {
      await context.reply(message, buttons);
      this.logger.log(`Отправлено сообщение: ${pageKey}`, this);
    }

    this.historyService.savePageHistory(context.session.pageHistory, pageKey);
  }

  private async ensureUserExists(
    telegramProfile: Omit<SaveTelegramProfile, 'userId'>,
  ): Promise<void> {
    const exists =
      await this.telegramProfilesDao.getTelegramProfileByTelegramId(
        telegramProfile.telegramId,
      );

    if (!exists) {
      const userId = await this.usersDao.createUser();

      if (userId) {
        await this.telegramProfilesDao.saveTelegramProfile({
          ...telegramProfile,
          userId,
        });
      }
    }
  }

  async goBackRender(context: Context): Promise<void> {
    const prevPage = this.historyService.getPreviousPage(context);

    if (!prevPage) {
      this.logger.error('История страниц пуста', this);
      return;
    }

    await this.renderPage(context, prevPage);
  }
}
