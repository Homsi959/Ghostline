import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
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
  SubscriptionStatus,
} from 'code/database/common/enums';
import { XrayClientService } from 'code/xray/xrayClient.service';
import { createReadStream } from 'fs';
import * as path from 'path';
import { RobokassaService } from 'code/payments/robokassa.service';
import { PAID_PLANS } from 'code/subscription/types';
import { SubscriptionService } from 'code/subscription/subscription.service';
import { DateTime } from 'luxon';
import { AppConfig } from 'code/config/types';
import {
  CONFIG_PROVIDER_TOKEN,
  DEVELOPMENT,
  DEVELOPMENT_LOCAL,
} from 'code/common/constants';

@Injectable()
export class TelegramService implements OnModuleInit {
  constructor(
    private readonly usersDao: UsersDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
    private readonly historyService: TelegramHistoryService,
    private readonly logger: WinstonService,
    @Inject(CONFIG_PROVIDER_TOKEN)
    private readonly config: AppConfig,
    private readonly subscriptionDao: SubscriptionDao,
    private readonly xrayClientService: XrayClientService,
    private readonly robokassaService: RobokassaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly vpnAccountsDao: VpnAccountsDao,
    private readonly paymentsDao: PaymentsDao,
  ) {}

  onModuleInit() {
    const maxLength = Number(this.config.telegram.limitLengthButton);

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

    if (!from) return;

    const sessionFrom: Omit<SaveTelegramProfile, 'userId'> = {
      isBot: from.is_bot,
      telegramId: from.id,
      languageCode: from.language_code,
    };

    const telegramProfile = await this.findTelegramProfile(
      sessionFrom.telegramId,
    );

    if (!telegramProfile) {
      await this.createUserWithTelegramProfile(sessionFrom);
    }

    await this.renderProtectedPage(context, PAGE_KEYS.HOME_PAGE);
  }

  async renderPage(context: Context, pageKey: string): Promise<void> {
    if (!context) {
      this.logger.error('Контекст отсутствует', this);
      throw new Error('Контекст отсутствует');
    }

    const { message, keyboardConfig, goBackButton } = telegramPages[pageKey];
    const telegramId = context.from?.id;
    const payload = flattenObject(context.session.payload);
    const previewImagePath = path.resolve(
      __dirname,
      '../../../assets/bot/main.png',
    );
    const previewImageStream = createReadStream(previewImagePath);

    // Заменяем только те плейсхолдеры, для которых есть значение в payload
    const renderedMessage = message.replace(
      /{{(.*?)}}/g,
      (_match, key: string): string => {
        const value = (payload as Record<string, unknown>)?.[key];
        return typeof value === 'string' || typeof value === 'number'
          ? String(value)
          : '';
      },
    );

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
    const rawPlan = context.session.payload.payment?.selectedPlan;
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

    const paidTransaction = await this.paymentsDao.find({
      transactionId,
      status: PaymentStatus.PAID,
    });

    if (paidTransaction && plan) {
      const vlessLink = await this.createActiveVpnAccess({
        userId: paidTransaction.userId,
      });

      if (vlessLink) context.session.payload.vlessLink = vlessLink;

      const subscriptionId = await this.subscriptionService.create({
        userId: paidTransaction.userId,
        plan,
      });

      this.logger.log(
        `Подписка с планом ${plan} создана (id=${subscriptionId})`,
        this,
      );

      await this.renderPage(context, PAGE_KEYS.GET_VPN_KEY_PAGE);
    } else {
      await context.answerCbQuery(MESSAGES.PAYMENT_IS_NOT_PAID, {
        show_alert: true,
      });
    }
  }

  async renderProtectedPage(context: Context, page: string): Promise<void> {
    const telegramId = context.from?.id ?? context.callbackQuery?.from?.id;

    if (!telegramId) return;

    const telegramProfile =
      await this.telegramProfilesDao.findTelegramProfileByTelegramId(
        telegramId,
      );
    if (!telegramProfile) {
      throw new Error(
        'Профиль Telegram не найден для данного идентификатора Telegram',
      );
    }

    context.session.payload.devicesLimit = String(this.config.devicesLimit);

    const subscription = await this.subscriptionDao.find({
      userId: telegramProfile.userId,
    });

    switch (page) {
      case PAGE_KEYS.HOME_PAGE: {
        if (!subscription) {
          return this.renderPage(context, PAGE_KEYS.HOME_PAGE);
        }

        if (subscription.status === SubscriptionStatus.ACTIVE) {
          if (subscription.endDate) {
            const endDateFormatted = DateTime.fromJSDate(subscription.endDate)
              .setLocale('ru')
              .toFormat('dd.MM.yyyy');

            context.session.payload.endDateSubscription = endDateFormatted;
          }
          return this.renderPage(context, PAGE_KEYS.ACTIVE_USER_HOME_PAGE);
        }

        if (
          subscription.status === SubscriptionStatus.EXPIRED &&
          subscription.plan === SubscriptionPlan.TRIAL
        ) {
          return this.renderPage(context, PAGE_KEYS.WITHOUT_TRIAL_HOME_PAGE);
        }

        if (subscription.status === SubscriptionStatus.EXPIRED) {
          const isUsedTrial = await this.subscriptionDao.find({
            userId: telegramProfile.userId,
            plan: SubscriptionPlan.TRIAL,
          });

          if (page === PAGE_KEYS.HOME_PAGE && !isUsedTrial) {
            return this.renderPage(context, PAGE_KEYS.HOME_PAGE);
          }

          if (page === PAGE_KEYS.HOME_PAGE) {
            return this.renderPage(context, PAGE_KEYS.WITHOUT_TRIAL_HOME_PAGE);
          } else {
            return this.renderPage(context, PAGE_KEYS.SUBSCRIPTION_IS_EXPIRED);
          }
        }

        return this.renderPage(context, PAGE_KEYS.HOME_PAGE);
      }

      case PAGE_KEYS.ACTIVE_USER_KEY_PAGE: {
        if (subscription?.status === SubscriptionStatus.EXPIRED) {
          return this.renderPage(context, PAGE_KEYS.SUBSCRIPTION_IS_EXPIRED);
        }

        const vlessLink = await this.xrayClientService.generateVlessLink(
          telegramProfile.userId,
        );
        context.session.payload.vlessLink = vlessLink;
        return this.renderPage(context, PAGE_KEYS.ACTIVE_USER_KEY_PAGE);
      }

      default: {
        return this.renderPage(context, page);
      }
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
  async createActiveVpnAccess({ userId }: { userId: string }): Promise<string> {
    const listenAddress = this.config.xray.listenAddress;
    const publicKey = this.config.xray.publicKey;
    const sni = this.config.xray.sni;
    const flow = this.config.xray.flow;
    const activeVpnAccount = await this.xrayClientService.findActiveOne(userId);

    if (activeVpnAccount) {
      this.logger.warn(`VPN-аккаунт уже существует для userId=${userId}`, this);
      const existingLink =
        await this.xrayClientService.generateVlessLink(userId);

      if (!existingLink) {
        throw new Error(
          'Ошибка генерации VLESS-ссылки для существующего аккаунта',
        );
      }

      return existingLink;
    }

    const vpnCreated = await this.xrayClientService.addClients([userId]);

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

    const vpnAccountPayload = {
      userId,
      sni,
      server: listenAddress,
      publicKey,
      port: 443,
      isBlocked: false,
      flow,
      devicesLimit: this.config.devicesLimit,
    };

    await this.vpnAccountsDao.create(vpnAccountPayload);

    this.logger.log(
      `🛠️ VPN-аккаунт зарегистрирован в БД для userId=${userId}`,
      this,
    );

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
    // Особый тариф для тестового Telegram-аккаунта Planet в проде
    const isProd = ![DEVELOPMENT, DEVELOPMENT_LOCAL].includes(
      this.config.nodeEnv,
    );
    const isTestAccount = telegramId === 5783023904;
    const finalAmount = isProd && isTestAccount ? 1 : amount;
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
      amount: finalAmount,
    });

    if (payment) {
      context.session.payload = {
        payment: {
          selectedPlan: plan,
          descriptionPlan: PAID_PLANS[plan].description,
          paymentLink: payment.link,
          transactionId: payment.invId,
          amount: String(amount),
        },
      };

      await this.renderPage(context, PAGE_KEYS.PAYMENT_PAGE);
    }
  }

  async activateTrialAccess({
    telegramId,
    context,
  }: {
    telegramId: number;
    context: Context;
  }) {
    const telegramProfile =
      await this.telegramProfilesDao.findTelegramProfileByTelegramId(
        telegramId,
      );

    if (!telegramProfile) {
      this.logger.error(`Отсутсвуте telegramProfile`, this);
      throw new Error(`Отсутсвуте telegramProfile`);
    }

    const subscriptionTrial = await this.subscriptionDao.find({
      userId: telegramProfile.userId,
      plan: SubscriptionPlan.TRIAL,
    });

    if (subscriptionTrial) {
      await this.renderPage(context, PAGE_KEYS.REPEATED_TRIAL_ATTEMPT_PAGE);
      this.logger.warn(
        `Попытка получить повторно триал версию клиенту с telegramId = ${telegramId}`,
        this,
      );
      return;
    }

    await this.subscriptionService.create({
      userId: telegramProfile.userId,
      plan: SubscriptionPlan.TRIAL,
    });

    const vlessLink = await this.createActiveVpnAccess({
      userId: telegramProfile.userId,
    });

    if (!vlessLink) {
      this.logger.error(`Не удалось сгенерировать vlessLink`, this);
      throw new Error(`Не удалось сгенерировать vlessLink`);
    }

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
