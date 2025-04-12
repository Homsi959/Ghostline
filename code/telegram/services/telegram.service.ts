import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersDao } from 'code/database/dao/users.dao';
import { SubscriptionDao, TelegramProfilesDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { addGoBackButton, buildInlineKeyboard } from 'code/common/utils';
import { PAGE_KEYS, telegramPages } from '../common/telegram.pages';
import { TelegramHistoryService } from './telegram.history.service';
import { Context } from '../common/telegram.types';
import { SaveTelegramProfile } from 'code/database/common/types';
import { TelegramSubscribingService } from './telegram.subscribing.service';
import { SubscriptionPlan } from 'code/database/common/enums';
import { ConfigService } from '@nestjs/config';
import { XrayClientService } from 'code/xray/xrayClient.service';
import { createReadStream } from 'fs';
import * as path from 'path';

@Injectable()
export class TelegramService implements OnModuleInit {
  constructor(
    private readonly usersDao: UsersDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
    private readonly historyService: TelegramHistoryService,
    private readonly telegramSubscribingService: TelegramSubscribingService,
    private readonly logger: WinstonService,
    private readonly configService: ConfigService,
    private readonly subscriptionDao: SubscriptionDao,
    private readonly xrayClientService: XrayClientService,
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
        ({ text }) => Array.from(text).length > maxLength,
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

      const telegramProfile = await this.findTelegramProfile(
        sessionFrom.telegramId,
      );

      if (telegramProfile) {
        const activeSubscribe =
          await this.subscriptionDao.findActiveSubscriptionById(
            telegramProfile.userId,
          );

        if (activeSubscribe) {
          const vlessLink = await this.xrayClientService.generateVlessLink(
            telegramProfile.userId,
          );

          context.session.payload.vlessLink = vlessLink;
          await this.renderPage(context, PAGE_KEYS.ACTIVE_USER_HOME_PAGE);
        } else {
          await this.renderPage(context, PAGE_KEYS.MAIN_PAGE);
        }
      } else {
        await this.createUserWithTelegramProfile(sessionFrom);
        await this.renderPage(context, PAGE_KEYS.MAIN_PAGE);
      }
    }
  }

  async renderPage(context: Context, pageKey: string): Promise<void> {
    if (!context) {
      this.logger.error('Контекст отсутствует', this);
      throw new Error('Контекст отсутствует');
    }

    const { message, keyboardConfig, goBackButton } = telegramPages[pageKey];
    const { text, dependencies } = message;
    const telegramId = context.from?.id;
    const payload = context.session.payload;
    const previewImagePath = path.resolve(
      __dirname,
      '../../../assets/bot/main.png',
    );
    const previewImageStream = createReadStream(previewImagePath);
    let renderedMessage = text;

    // Если у сообщения указаны зависимости — заменяем плейсхолдеры на значения из payload
    if (dependencies?.length) {
      renderedMessage = dependencies.reduce((result, key) => {
        const replacement = payload?.[key as keyof typeof payload] ?? '';
        const placeholder = new RegExp(`{{${key}}}`, 'g');

        return result.replace(placeholder, replacement);
      }, text);
    }

    let buttons = keyboardConfig
      ? buildInlineKeyboard(keyboardConfig.buttons, keyboardConfig.columns)
      : undefined;

    if (goBackButton) {
      buttons = addGoBackButton(buttons);
    }

    if (context.callbackQuery && buttons) {
      await context.editMessageMedia(
        {
          type: 'photo',
          media: { source: previewImageStream },
          caption: renderedMessage,
          parse_mode: 'HTML',
        },
        {
          reply_markup: buttons?.reply_markup,
        },
      );

      this.logger.log(
        `Для пользователя c telegramId: ${telegramId}, отрисована страница: ${pageKey}`,
        this,
      );
    } else {
      await context.replyWithPhoto(
        { source: previewImageStream },
        {
          caption: renderedMessage,
          parse_mode: 'HTML',
          reply_markup: buttons?.reply_markup?.inline_keyboard
            ? { inline_keyboard: buttons.reply_markup.inline_keyboard }
            : undefined,
        },
      );
      this.logger.log(`Отправлено сообщение со страницей: ${pageKey}`, this);
    }

    this.historyService.savePageHistory(context.session.pageHistory, pageKey);
  }

  private async findTelegramProfile(
    telegramId: number,
  ): Promise<SaveTelegramProfile | null> {
    const telegramProfile =
      await this.telegramProfilesDao.getTelegramProfileByTelegramId(telegramId);

    if (telegramProfile) {
      this.logger.log(`Найден профиль Telegram c ID=${telegramId}`, this);
      return telegramProfile;
    } else {
      this.logger.warn(`Не найден профиль Telegram c ID=${telegramId}`, this);
      return null;
    }
  }

  private async createUserWithTelegramProfile(
    telegramProfile: Omit<SaveTelegramProfile, 'userId'>,
  ): Promise<void> {
    const userId = await this.usersDao.createUser();

    if (userId) {
      this.logger.log(`Создан пользователь с ID: ${userId}`, this);

      await this.telegramProfilesDao.saveTelegramProfile({
        ...telegramProfile,
        userId,
      });
      this.logger.log(
        `Сохранен Telegram профиль с TelegramID: ${telegramProfile.telegramId}`,
        this,
      );
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
    const vlessLink = await this.telegramSubscribingService.processPurchase({
      telegramId,
      plan,
    });

    if (!vlessLink) return;

    context.session.payload.vlessLink = vlessLink;
    await this.renderPage(context, PAGE_KEYS.GET_VPN_KEY_PAGE);
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
