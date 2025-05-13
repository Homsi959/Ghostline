import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  PaidSubscriptionPlan,
  SubscriptionPlan,
  SubscriptionStatus,
} from 'code/database/common/enums';
import { SubscriptionDao, VpnAccountsDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { XrayClientService } from 'code/xray/xrayClient.service';
import { DateTime } from 'luxon';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(
    private readonly subscriptionDao: SubscriptionDao,
    private readonly xrayClientService: XrayClientService,
    private readonly vpnAccountsDao: VpnAccountsDao,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Выполняет однократную проверку при старте приложения
   */
  async onModuleInit() {
    await this.checkAndDeactivateExpired();
  }

  /**
   * Создаёт подписку в базе данных с учётом московского времени.
   *
   * @param userId ID пользователя
   * @param plan План подписки (платный или любой)
   * @returns ID созданной подписки
   * @throws Если расчёт даты или создание не удалось
   */
  async create({
    userId,
    plan,
  }: {
    userId: string;
    plan: SubscriptionPlan | PaidSubscriptionPlan;
  }): Promise<string> {
    const start = DateTime.now().setZone('Europe/Moscow');
    const end = this.calculateEndDate(start, plan);

    if (!end) {
      throw new Error(
        `Не удалось рассчитать дату окончания подписки для плана "${plan}"`,
      );
    }

    const subscriptionId = await this.subscriptionDao.create({
      userId,
      plan,
      startDate: start.toJSDate(),
      endDate: end.toJSDate(),
    });

    if (!subscriptionId) {
      throw new Error(`Не удалось создать подписку для пользователя ${userId}`);
    }

    return subscriptionId;
  }

  /**
   * Вычисляет дату окончания подписки в зависимости от типа плана.
   */
  private calculateEndDate(
    startDate: DateTime,
    plan: SubscriptionPlan | PaidSubscriptionPlan,
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
   * Проверяет подписки каждую минуту и деактивирует истёкшие.
   */
  @Cron('*/1 * * * *')
  private async checkAndDeactivateExpired() {
    const subscriptions = await this.subscriptionDao.findAll();

    if (!subscriptions) return;

    for (const { userId, endDate, status } of subscriptions) {
      const nowUtc = DateTime.utc();
      const endDateUtc = DateTime.fromJSDate(new Date(endDate)).toUTC();
      const isExpired = nowUtc > endDateUtc;

      if (isExpired && status !== SubscriptionStatus.EXPIRED) {
        try {
          await this.subscriptionDao.markAsExpired(userId);
          await this.xrayClientService.removeClient(userId);
          await this.vpnAccountsDao.removeVpnAccount(userId);
          await this.vpnAccountsDao.toggleVpnAccountBlock(userId, true);

          this.logger.warn(
            `Подписка пользователя ${userId} деактивирована: срок действия истёк (${endDateUtc.toISO()})`,
            this,
          );
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          this.logger.error(
            `Ошибка при деактивации подписки userId=${userId}: ${errorMessage}`,
            this,
          );
        }
      }
    }
  }
}
