import { Inject, Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { DATABASE_TOKEN } from 'code/common/constants';
import { ActiveSubscription } from '../common/types';
import { SubscriptionEntity } from '../common/entities';
import { SubscriptionStatus } from '../common/enums';

/**
 * DAO подписок.
 */
@Injectable()
export class SubscriptionDao {
  /**
   * @param logger - сервис логирования.
   * @param db - соеденение с БД.
   */
  constructor(
    private readonly logger: WinstonService,
    @Inject(DATABASE_TOKEN) private readonly db: Pool,
  ) {}

  /**
   * Возвращает активную подписку пользователя, если она есть.
   *
   * @param userId - UUID пользователя
   * @returns Объект активной подписки или null, если не найдено
   */
  async findActiveSubscriptionById(
    userId: string,
  ): Promise<ActiveSubscription | null> {
    const query = {
      name: 'find-active-subscription-by-id',
      text: `
      SELECT *
      FROM subscriptions
      WHERE user_id = $1 AND status = 'active'
      LIMIT 1
    `,
      values: [userId],
    };

    try {
      const { rows } = await this.db.query<SubscriptionEntity>(query);

      if (rows.length == 0) {
        this.logger.warn(
          `Нет активных подписок у пользователя: ${userId}`,
          this,
        );
        return null;
      }

      const row = rows[0];
      const activeSubscription: ActiveSubscription = {
        status: SubscriptionStatus.ACTIVE,
        userId: row.user_id,
        plan: row.plan,
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.created_at,
      };

      return activeSubscription;
    } catch (error: any) {
      this.logger.error(`Не удалось найти активную подписку`, this, error);
      return null;
    }
  }

  /**
   * Создаёт подписку в базе данных.
   * @param data - Данные подписки.
   * @returns Созданная подписка либо null.
   */
  async createSubscription(): Promise<any> {}
}
