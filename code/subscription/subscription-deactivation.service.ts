import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubscriptionStatus } from 'code/database/common/enums';
import { SubscriptionDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { XrayClientService } from 'code/xray/xrayClient.service';
import { DateTime } from 'luxon';

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

    if (!subscriptions?.length) return;

    for (const { userId, endDate, status } of subscriptions) {
      const nowUtc = DateTime.utc();
      const endDateUtc = DateTime.fromJSDate(new Date(endDate)).toUTC();
      const isExpired = nowUtc > endDateUtc;

      if (isExpired && status !== SubscriptionStatus.EXPIRED) {
        try {
          await this.subscriptionDao.markAsExpired(userId);
          await this.xrayClientService.removeClient(userId);

          this.logger.warn(
            `Подписка пользователя ${userId} деактивирована: срок действия истёк (${endDateUtc.toISO()})`,
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
