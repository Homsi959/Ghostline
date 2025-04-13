import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubscriptionStatus } from 'code/database/common/enums';
import { SubscriptionDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { XrayClientService } from 'code/xray/xrayClient.service';

@Injectable()
export class SubscriptionDeactivationService implements OnModuleInit {
  constructor(
    private readonly subscriptionDao: SubscriptionDao,
    private readonly xrayClientService: XrayClientService,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Выполняет однократную проверку при старте приложения
   */
  async onModuleInit() {
    await this.checkAndDeactivateExpired();
  }

  /**
   * Проверяет подписки каждую минуту и деактивирует истёкшие.
   */
  @Cron('* * * * *')
  private async checkAndDeactivateExpired() {
    const subscriptions = await this.subscriptionDao.findAll();
    const nowUtc = new Date();
    const moscowOffsetMs = 3 * 60 * 60 * 1000;
    const nowMoscow = new Date(nowUtc.getTime() + moscowOffsetMs);

    if (!subscriptions) return;

    for (const { userId, endDate, status } of subscriptions) {
      const isExpired = nowMoscow > new Date(endDate);

      if (isExpired && status !== SubscriptionStatus.EXPIRED) {
        try {
          await this.subscriptionDao.markAsExpired(userId);
          await this.xrayClientService.removeClient(userId);

          this.logger.warn(
            `Подписка пользователя ${userId} деактивирована: срок действия истёк (${endDate.toISOString()})`,
            this,
          );
        } catch (error: any) {
          this.logger.error(
            `Ошибка при деактивации подписки userId=${userId}: ${error.message}`,
            this,
          );
        }
      }
    }
  }
}
