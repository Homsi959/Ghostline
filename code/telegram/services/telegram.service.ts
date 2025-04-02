import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersDao } from 'code/database/dao/users.dao';
import { TelegramProfilesDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { addGoBackButton, buildInlineKeyboard } from 'code/common/utils';
import { PAGE_KEYS, telegramPages } from '../common/telegram.pages';
import { TelegramHistoryService } from './telegram.history.service';
import { Context } from '../common/telegram.types';
import { SaveTelegramProfile } from 'code/database/common/types';
import { TelegramSubscribingService } from './telegram.subscribing.service';
import { SubscriptionPlan } from 'code/database/common/enums';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService implements OnModuleInit {
  constructor(
    private readonly usersDao: UsersDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
    private readonly historyService: TelegramHistoryService,
    private readonly telegramSubscribingService: TelegramSubscribingService,
    private readonly logger: WinstonService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const limitLengthButton = this.configService.get<string>(
      'LIMIT_LENGTH_BUTTON',
    );

    if (!limitLengthButton) {
      throw new Error('Не получен лимит из конфига');
    }

    const maxLength = Number(limitLengthButton);

    for (const { keyboardConfig } of Object.values(telegramPages)) {
      if (!keyboardConfig) continue;

      const tooLongButton = keyboardConfig.buttons.find(
        ({ text }) => text.length > maxLength,
      );

      if (tooLongButton) {
        this.logger.error(
          `Кнопка "${tooLongButton.text}" превышает лимит в ${maxLength} символов`,
          this,
        );
        throw new Error('Лимит длины строки кнопки превышен');
      }
    }
  }

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

  async renderPage(
    context: Context,
    pageKey: string,
    payload?: Record<string, string>,
  ): Promise<void> {
    if (!context) {
      this.logger.error('Контекст отсутствует', this);
      throw new Error('Контекст отсутствует');
    }

    const { message, keyboardConfig, goBackButton } = telegramPages[pageKey];
    const renderedMessage = payload
      ? Object.entries(payload).reduce(
          (msg, [key, value]) =>
            msg.replace(new RegExp(`{{${key}}}`, 'g'), value),
          message,
        )
      : message;

    let buttons = keyboardConfig
      ? buildInlineKeyboard(keyboardConfig.buttons, keyboardConfig.columns)
      : undefined;

    if (goBackButton) {
      buttons = addGoBackButton(buttons);
    }

    if (context.callbackQuery && buttons) {
      await context.editMessageText(renderedMessage, {
        parse_mode: 'HTML',
        reply_markup: buttons.reply_markup,
      });

      this.logger.log(`Отрисована страница: ${pageKey}`, this);
    } else {
      await context.reply(renderedMessage, buttons);
      this.logger.log(`Отправлено сообщение со страницей: ${pageKey}`, this);
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

    if (exists) {
      this.logger.log(
        `Найден профиль Telegram для c ID=${telegramProfile.telegramId}`,
        this,
      );
    } else {
      const userId = await this.usersDao.createUser();

      if (userId) {
        this.logger.log(`Создан пользователь с ID: ${userId}`, this);

        await this.telegramProfilesDao.saveTelegramProfile({
          ...telegramProfile,
          userId,
        });
      }
    }
  }

  /**
   * Вызывает метод для оформления подписки
   */
  async subscribe({
    telegramId,
    plan,
    context,
  }: {
    telegramId: number;
    plan: SubscriptionPlan;
    context: Context;
  }) {
    const link = await this.telegramSubscribingService.processPurchase({
      telegramId,
      plan,
    });

    if (!link) return;
    await this.renderPage(context, PAGE_KEYS.GET_VPN_KEY_PAGE, {
      vlessLink: link,
    });
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
