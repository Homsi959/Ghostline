import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { SubscriptionDao, TelegramProfilesDao } from 'code/database/dao';
import { SubscriptionPlan } from 'code/database/common/enums';
import { XrayService } from 'code/xray/xray.service';

@Injectable()
export class TelegramSubscribingService {
  constructor(
    private readonly logger: WinstonService,
    private readonly subscriptionDao: SubscriptionDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
    private readonly xrayService: XrayService,
  ) {}

  /**
   * Обрабатывает покупку и активирует подписку.
   */
  async processPurchase({
    telegramId,
    plan,
  }: {
    telegramId: number;
    plan: SubscriptionPlan;
  }): Promise<string | void> {
    const telegramProfile =
      await this.telegramProfilesDao.getTelegramProfileByTelegramId(telegramId);

    if (!telegramProfile) {
      this.logger.error(`Не найден Telegram-профиль с ID: ${telegramId}`, this);
      return;
    }

    this.logger.log(`Найден профиль Telegram с ID=${telegramId}`, this);

    const userId = telegramProfile.userId;
    const hasSubscription =
      await this.subscriptionDao.findActiveSubscriptionById(userId);

    if (hasSubscription) {
      this.logger.log(
        `Пользователь ${userId} уже имеет активную подписку`,
        this,
      );
      return;
    }

    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, plan);

    if (!endDate) return;

    const subscription = await this.createSubscription(
      userId,
      plan,
      startDate,
      endDate,
    );

    if (!subscription) return;

    const vpnCreated = this.createVpnAccount(userId);

    if (!vpnCreated) return;

    return this.generateVpnLink(userId);
  }

  /**
   * Вычисляет дату окончания подписки в зависимости от типа плана.
   */
  private calculateEndDate(
    startDate: Date,
    plan: SubscriptionPlan,
  ): Date | null {
    const endDate = new Date(startDate);

    switch (plan) {
      case SubscriptionPlan.TRIAL:
        endDate.setDate(startDate.getDate() + 7);
        break;
      case SubscriptionPlan.ONE_MONTH:
        endDate.setUTCMonth(startDate.getUTCMonth() + 1);
        break;
      case SubscriptionPlan.SIX_MONTHS:
        endDate.setUTCMonth(startDate.getUTCMonth() + 6);
        break;
      default:
        this.logger.error(`Неизвестный тип подписки: ${String(plan)}`);
        return null;
    }

    return endDate;
  }

  /**
   * Создает подписку в БД.
   */
  private async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    start: Date,
    end: Date,
  ) {
    const subscription = await this.subscriptionDao.createSubscription({
      userId,
      plan,
      startDate: start,
      endDate: end,
    });

    if (!subscription) {
      this.logger.warn(
        `Не удалось создать подписку: план ${plan}, пользователь ${userId}`,
        this,
      );
      return null;
    }

    this.logger.log(
      `Подписка активирована для пользователя ${userId} на план ${plan}`,
      this,
    );
    return subscription;
  }

  /**
   * Создает VPN-аккаунт через Xray.
   */
  private createVpnAccount(userId: string): boolean {
    const added = this.xrayService.addVpnAccounts([
      {
        id: userId,
        flow: 'xtls-rprx-vision',
      },
    ]);

    if (!added) {
      this.logger.warn(`Не удалось добавить VPN клиента ${userId}`, this);
    }

    return added;
  }

  /**
   * Генерирует ссылку подключения VLESS.
   */
  private generateVpnLink(userId: string): string {
    const { inbounds } = this.xrayService.readConfig();
    const { protocol, streamSettings } = inbounds[0];

    if (!streamSettings?.security) {
      throw new Error('Отсутствует настройка безопасности в конфиге Xray');
    }

    return this.xrayService.generateVlessLink({
      userId,
      protocol,
      security: streamSettings.security,
      flow: 'xtls-rprx-vision',
      pbk: '',
      shortId: '',
      tag: 'HomsiVPN | VLESS | Reality | 🇳🇱 NL',
    });
  }
}
