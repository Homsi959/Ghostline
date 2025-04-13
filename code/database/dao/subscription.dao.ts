import { Inject, Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { DATABASE_TOKEN } from 'code/common/constants';
import {
  ActivateSubscription,
  ActiveSubscription,
  Subscription,
} from '../common/types';
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
   * Создаёт подписку в базе данных.
   * @param data - Данные подписки.
   * @returns ID созданной подписки или null.
   */
  async create({
    userId,
    plan,
    startDate,
    endDate,
  }: ActivateSubscription): Promise<string | null> {
    const query = {
      name: 'create-subscription',
      text: `
      INSERT INTO subscriptions (
        plan,
        start_date,
        end_date,
        status,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
      values: [plan, startDate, endDate, SubscriptionStatus.ACTIVE, userId],
    };

    try {
      const { rows } = await this.db.query<{ id: string }>(query);
      const idActivatedSubscription = rows[0]?.id ?? null;

      return idActivatedSubscription ?? null;
    } catch (error: any) {
      this.logger.error(`Ошибка создания подписки: ${error.message}`, this);
      return null;
    }
  }

  /**
   * Возвращает активную подписку пользователя, если она есть.
   *
   * @param userId - UUID пользователя
   * @returns Объект активной подписки или null, если не найдено
   */
  async findActiveById(userId: string): Promise<ActiveSubscription | null> {
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

      if (rows.length == 0) return null;

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
   * Возвращает все активные подписки из таблицы subscriptions.
   * Используется для обработки и синхронизации с конфигурацией Xray.
   *
   * @returns Массив объектов ActiveSubscription или null, если подписок нет или произошла ошибка.
   */
  async findAll(): Promise<Subscription[] | null> {
    const query = {
      name: 'find-all-subscription',
      text: `SELECT * FROM subscriptions`,
      values: [],
    };

    try {
      const { rows } = await this.db.query<SubscriptionEntity>(query);

      if (rows.length == 0) return null;

      const activeSubscriptions: Subscription[] = rows.map((row) => ({
        status: SubscriptionStatus.ACTIVE,
        userId: row.user_id,
        plan: row.plan,
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.created_at,
      }));

      return activeSubscriptions;
    } catch (error: any) {
      this.logger.error(`Не удалось найти активную подписку`, this, error);
      return null;
    }
  }

  /**
   * Обновляет статус подписки на 'expired' для указанного пользователя.
   * Используется при окончании срока действия подписки.
   *
   * @param userId - Идентификатор пользователя
   * @returns true, если обновление прошло успешно
   * @throws Error, если обновление не удалось
   */
  async markAsExpired(userId: string): Promise<boolean> {
    const query = {
      name: 'mark-as-expired-subscription',
      text: `UPDATE subscriptions
           SET status = 'expired'
           WHERE user_id = $1`,
      values: [userId],
    };

    try {
      await this.db.query(query);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Не удалось отметить подписку как истекшую`,
        this,
        error,
      );
      throw new Error('Ошибка при обновлении статуса подписки');
    }
  }
}
