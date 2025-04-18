import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import {
  SubscriptionDao,
  TelegramProfilesDao,
  VpnAccountsDao,
} from 'code/database/dao';
import { SubscriptionPlan } from 'code/database/common/enums';
import { XrayClientService } from 'code/xray/xrayClient.service';
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

  async getTrialVpnAccount(telegramId: number): Promise<string | void> {
    const telegramProfile =
      await this.telegramProfilesDao.findTelegramProfileByTelegramId(
        telegramId,
      );
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
