import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import {
  SubscriptionDao,
  TelegramProfilesDao,
  VpnAccountsDao,
} from 'code/database/dao';
import { SubscriptionPlan } from 'code/database/common/enums';
import { XrayClientService } from 'code/xray/xrayClient.service';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramSubscribingService {
  constructor(
    private readonly logger: WinstonService,
    private readonly subscriptionDao: SubscriptionDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
    private readonly vpnAccountsDao: VpnAccountsDao,
    private readonly xrayClientService: XrayClientService,
    private readonly configService: ConfigService,
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

    const startDate = DateTime.utc();
    const endDate = this.calculateEndDate(startDate, plan);

    if (!endDate) return;

    const subscription = await this.subscriptionDao.create({
      userId,
      plan,
      startDate: startDate.toJSDate(),
      endDate: endDate.toJSDate(),
    });

    if (!subscription) return;

    const vpnCreated = await this.createVpnAccount(userId);

    if (!vpnCreated) return;

    return this.xrayClientService.generateVlessLink(userId);
  }

  async getTrialVpnAccount(telegramId: number): Promise<string | void> {
    const telegramProfile =
      await this.telegramProfilesDao.getTelegramProfileByTelegramId(telegramId);
    const plan = SubscriptionPlan.TRIAL;

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

    const startDate = DateTime.utc();
    const endDate = this.calculateEndDate(startDate, plan);

    if (!endDate) return;

    const subscription = await this.subscriptionDao.create({
      userId,
      plan,
      startDate: startDate.toJSDate(),
      endDate: endDate.toJSDate(),
    });

    if (!subscription) return;
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

    const vpnCreated = await this.createVpnAccount(userId);
    // @ts-ignore
    const addedVpnAccount = await this.vpnAccountsDao.create(vpnAccountPayload);

    if (!vpnCreated || !addedVpnAccount) return;

    return this.xrayClientService.generateVlessLink(userId);
  }

  /**
   * Вычисляет дату окончания подписки в зависимости от типа плана.
   */
  private calculateEndDate(
    startDate: DateTime,
    plan: SubscriptionPlan,
  ): DateTime | null {
    switch (plan) {
      case SubscriptionPlan.TRIAL:
        return startDate.plus({ days: 7 });
      case SubscriptionPlan.ONE_MONTH:
        return startDate.plus({ months: 1 });
      case SubscriptionPlan.SIX_MONTHS:
        return startDate.plus({ months: 6 });
      default:
        this.logger.error(`Неизвестный тип подписки: ${String(plan)}`);
        return null;
    }
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
