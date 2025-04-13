import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { SubscriptionDao, TelegramProfilesDao } from 'code/database/dao';
import { SubscriptionPlan } from 'code/database/common/enums';
import { XrayClientService } from 'code/xray/xrayClient.service';

@Injectable()
export class TelegramSubscribingService {
  constructor(
    private readonly logger: WinstonService,
    private readonly subscriptionDao: SubscriptionDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
    private readonly xrayClientService: XrayClientService,
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
    const hasSubscription = await this.subscriptionDao.findActiveById(userId);

    if (hasSubscription) {
      this.logger.warn(
        `Пользователь ${userId} уже имеет активную подписку`,
        this,
      );
      return;
    }

    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, plan);

    if (!endDate) return;

    const subscription = await this.create(userId, plan, startDate, endDate);

    if (!subscription) return;

    const vpnCreated = await this.createVpnAccount(userId);

    if (!vpnCreated) return;

    return this.xrayClientService.generateVlessLink(userId);
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
  private async create(
    userId: string,
    plan: SubscriptionPlan,
    start: Date,
    end: Date,
  ) {
    const subscription = await this.subscriptionDao.create({
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
  private async createVpnAccount(userId: string): Promise<boolean> {
    const added = await this.xrayClientService.addVpnAccounts([userId]);

    if (!added) {
      this.logger.warn(`Не удалось добавить VPN клиента ${userId}`, this);
    }

    return added;
  }
}
