import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersDao } from 'code/database/dao/users.dao';
import {
  PaymentsDao,
  SubscriptionDao,
  TelegramProfilesDao,
  VpnAccountsDao,
} from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import {
  addGoBackButton,
  buildInlineKeyboard,
  flattenObject,
} from 'code/common/utils';
import { MESSAGES, PAGE_KEYS, telegramPages } from '../common/telegram.pages';
import { TelegramHistoryService } from './telegram.history.service';
import { Context } from '../common/telegram.types';
import { SaveTelegramProfile } from 'code/database/common/types';
import {
  PaidSubscriptionPlan,
  PaymentStatus,
  SubscriptionPlan,
} from 'code/database/common/enums';
import { ConfigService } from '@nestjs/config';
import { XrayClientService } from 'code/xray/xrayClient.service';
import { createReadStream } from 'fs';
import * as path from 'path';
import { RobokassaService } from 'code/payments/robokassa.service';
import { PAID_PLANS } from 'code/subscription/types';
import { SubscriptionService } from 'code/subscription/subscription.service';
import { CreateActiveVpnAccess } from './types';

@Injectable()
export class TelegramService implements OnModuleInit {
  constructor(
    private readonly usersDao: UsersDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
    private readonly historyService: TelegramHistoryService,
    private readonly logger: WinstonService,
    private readonly configService: ConfigService,
    private readonly subscriptionDao: SubscriptionDao,
    private readonly xrayClientService: XrayClientService,
    private readonly robokassaService: RobokassaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly vpnAccountsDao: VpnAccountsDao,
    private readonly paymentsDao: PaymentsDao,
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
        const activeSubscribe = await this.subscriptionDao.findActiveById(
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
    const payload = flattenObject(context.session.payload);
    const previewImagePath = path.resolve(
      __dirname,
      '../../../assets/bot/main.png',
    );
    const previewImageStream = createReadStream(previewImagePath);
    let renderedMessage = text;

    // TODO сделай заменю зависимостей по аналогии с кнопками
    // Если у сообщения указаны зависимости — заменяем плейсхолдеры на значения из payload
    if (dependencies?.length) {
      renderedMessage = dependencies.reduce((result, key) => {
        const replacement =
          typeof payload?.[key] === 'string' ? payload[key] : '';
        const placeholder = new RegExp(`{{${key}}}`, 'g');

        return result.replace(placeholder, replacement);
      }, text);
    }

    let buttons = keyboardConfig
      ? buildInlineKeyboard({
          columns: keyboardConfig.columns ?? 1,
          arr: keyboardConfig.buttons,
          payload: context.session.payload,
        })
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
      await this.telegramProfilesDao.findTelegramProfileByTelegramId(
        telegramId,
      );

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

  async handlePaymentCheck(context: Context): Promise<void> {
    const transactionId = context.session.payload.payment?.transactionId;
    const rawPlan = context.session.payload.payment?.plan;
    const isValidPlan = Object.values(SubscriptionPlan).includes(
      rawPlan as SubscriptionPlan,
    );

    if (!isValidPlan) {
      this.logger.warn(`Недопустимый план в сессии: ${rawPlan}`, this);
      throw new Error('Некорректный тарифный план');
    }

    const plan = rawPlan as SubscriptionPlan;
    if (!transactionId) {
      throw new Error('Отсутсвует transactionId');
    }

    const transaction = await this.paymentsDao.find({
      transactionId,
      status: PaymentStatus.PAID,
    });

    if (transaction && plan) {
      const vlessLink = await this.createActiveVpnAccess({
        userId: transaction.userId,
        plan,
      });

      if (vlessLink) context.session.payload.vlessLink = vlessLink;
      await this.renderPage(context, PAGE_KEYS.GET_VPN_KEY_PAGE);
    } else {
      await context.answerCbQuery(MESSAGES.PAYMENT_IS_NOT_PAID.text, {
        show_alert: true,
      });
    }
  }

  /**
   * Активирует доступ к VPN: создаёт подписку, VPN-аккаунт и генерирует VLESS-ссылку.
   *
   * @param userId - Идентификатор пользователя.
   * @param plan - Выбранный тарифный план.
   * @returns VLESS-ссылка для подключения.
   * @throws Ошибка, если на любом этапе активация невозможна.
   */
  async createActiveVpnAccess({
    userId,
    plan,
  }: CreateActiveVpnAccess): Promise<string> {
    this.logger.log(`Активация VPN-доступа для userId=${userId}`, this);

    const subscriptionId = await this.subscriptionService.create({
      userId,
      plan,
    });

    if (!subscriptionId) {
      this.logger.error(
        `Не удалось создать подписку для userId=${userId}`,
        this,
      );
      throw new Error('Не удалось создать подписку');
    }

    this.logger.log(`Подписка создана (id=${subscriptionId})`, this);

    const vpnCreated = await this.xrayClientService.addVpnAccounts([userId]);

    if (!vpnCreated) {
      this.logger.error(
        `Не удалось создать VPN-аккаунт для userId=${userId}`,
        this,
      );
      throw new Error('Не удалось создать VPN-аккаунт');
    }

    this.logger.log(`VPN-аккаунт создан для userId=${userId}`, this);

    const vlessLink = await this.xrayClientService.generateVlessLink(userId);

    if (!vlessLink) {
      this.logger.error(
        `Не удалось сгенерировать VLESS-ссылку для userId=${userId}`,
        this,
      );
      throw new Error('Ошибка генерации VLESS-ссылки');
    }

    this.logger.log(`Ссылка сгенерирована для userId=${userId}`, this);

    return vlessLink;
  }

  /**
   * Инициализирует процесс оплаты подписки: создаёт ссылку на оплату,
   * сохраняет данные в сессию и отображает пользователю страницу оплаты.
   *
   * @param telegramId - Telegram ID пользователя
   * @param plan - Выбранный тарифный план
   */
  async initiateSubscriptionPayment({
    telegramId,
    plan,
    context,
  }: {
    telegramId: number;
    plan: PaidSubscriptionPlan;
    context: Context;
  }): Promise<void> {
    const { description, amount } = PAID_PLANS[plan];
    const telegramProfile =
      await this.telegramProfilesDao.findTelegramProfileByTelegramId(
        telegramId,
      );

    if (!telegramProfile || !plan) {
      this.logger.error(`Telegram профиль не найден`);
      return;
    }

    const payment = await this.robokassaService.createPaymentTransaction({
      userId: telegramProfile.userId,
      description,
      amount,
    });

    if (payment) {
      context.session.payload = {
        payment: {
          plan,
          paymentLink: payment.link,
          transactionId: payment.invId,
          amount: String(amount),
        },
      };
      await this.renderPage(context, PAGE_KEYS.PAYMENT_PAGE);
    }
  }

  async getTrial({
    telegramId,
    context,
  }: {
    telegramId: number;
    context: Context;
  }) {
    // const vlessLink =
    //   await this.telegramSubscribingService.getTrialVpnAccount(telegramId);

    // if (!vlessLink) return;

    // context.session.payload.vlessLink = vlessLink;
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

  /**
   * Создаёт VPN-аккаунт для пользователя на основе Telegram ID, если у него нет активной подписки.
   * Генерирует и возвращает VLESS-ссылку для подключения к VPN.
   *
   * @param telegramId - Telegram ID пользователя
   * @returns Сгенерированная VLESS-ссылка или `void`, если создание невозможно
   */
  async createVpnAccount(telegramId: number): Promise<string | void> {
    const telegramProfile =
      await this.telegramProfilesDao.findTelegramProfileByTelegramId(
        telegramId,
      );

    if (!telegramProfile) {
      this.logger.error(
        `Telegram-профиль не найден (telegramId=${telegramId})`,
        this,
      );
      return;
    }

    this.logger.log(
      `Найден Telegram-профиль: telegramId=${telegramId}, userId=${telegramProfile.userId}`,
      this,
    );

    const userId = telegramProfile.userId;
    const hasSubscription = await this.subscriptionDao.findActiveById(userId);

    if (hasSubscription) {
      this.logger.warn(
        `Пользователь userId=${userId} уже имеет активную подписку`,
        this,
      );
      return;
    }

    const XRAY_LISTEN_IP = this.configService.get<string>('XRAY_LISTEN_IP');
    const XRAY_PUBLIC_KEY = this.configService.get<string>('XRAY_PUBLIC_KEY');
    const XRAY_FLOW = this.configService.get<string>('XRAY_FLOW');

    const vpnAccountPayload = {
      userId,
      sni: 'www.microsoft.com',
      server: XRAY_LISTEN_IP,
      publicKey: XRAY_PUBLIC_KEY,
      port: '443',
      isBlocked: false,
      flow: XRAY_FLOW,
      devicesLimit: 3,
    };

    // @ts-ignore
    await this.vpnAccountsDao.create(vpnAccountPayload);

    this.logger.log(`🛠️ VPN-аккаунт создан для userId=${userId}`, this);

    return this.xrayClientService.generateVlessLink(userId);
  }
}
