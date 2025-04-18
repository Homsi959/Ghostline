import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { CreateTransaction, Transaction } from '../common/types';
import { PaymentEntity } from '../common/entities';
import { PaymentStatus } from '../common/enums';
import { DateTime } from 'luxon';

/**
 * DAO транзакции оплаты.
 */
@Injectable()
export class PaymentsDao {
  /**
   * @param logger - сервис логирования.
   * @param db - соеденение с БД.
   */
  constructor(
    private readonly logger: WinstonService,
    @Inject(DATABASE_TOKEN) private readonly db: Pool,
  ) {}

  /**
   * Ищет транзакции по заданным параметрам. Можно передавать любую комбинацию полей.
   *
   * @param filters - Объект с критериями поиска.
   * @returns Первая найденная транзакция или null.
   * @throws Ошибка при обращении к базе данных.
   */
  async find(filters: Partial<Transaction>): Promise<Transaction | null> {
    const conditions: string[] = [];
    const values: any[] = [];

    let index = 1;

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;

      let column = key;
      if (key === 'paymentMethod') column = 'payment_method';
      else if (key === 'transactionId') column = 'transaction_id';
      else if (key === 'createdAt') column = 'created_at';
      else if (key === 'userId') column = 'user_id';
      else if (key === 'paidAt') column = 'paid_at';

      conditions.push(`${column} = $${index++}`);
      values.push(value);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = {
      text: `
          SELECT * 
          FROM payments
          ${whereClause}
          LIMIT 1
        `,
      values,
    };

    try {
      const { rows } = await this.db.query<PaymentEntity>(query);

      if (rows.length === 0) return null;

      const row = rows[0];

      return {
        id: row.id,
        amount: Number(row.amount),
        currency: row.currency,
        paymentMethod: row.payment_method,
        transactionId: row.transaction_id,
        status: row.status,
        createdAt: row.created_at,
        userId: row.user_id,
        description: row.description,
        paidAt: row.paid_at,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Не удалось получить транзакцию: ${errorMessage}`,
        this,
      );

      throw new Error('Ошибка при получении транзакции из базы данных');
    }
  }

  /**
   * Создаёт новую транзакцию в базе данных.
   * @param data Данные транзакции для создания.
   * @returns Объект созданной транзакции.
   * @throws Ошибка, если запрос в БД не удался.k
   */
  async create({
    amount,
    currency,
    description,
    paymentMethod,
    transactionId,
    userId,
    createdAt,
  }: CreateTransaction): Promise<Transaction> {
    const query = {
      name: 'create-payment',
      text: `
      INSERT INTO payments (
        amount,
        currency,
        description,
        payment_method,
        status,
        transaction_id,
        user_id,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      values: [
        amount,
        currency,
        description,
        paymentMethod,
        PaymentStatus.PENDING,
        transactionId,
        userId,
        createdAt,
      ],
    };

    try {
      const { rows } = await this.db.query<PaymentEntity>(query);
      const payment = rows[0];

      return {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.payment_method,
        transactionId: payment.transaction_id,
        status: payment.status,
        createdAt: payment.created_at,
        userId: payment.user_id,
        description: payment.description,
        paidAt: payment.paid_at,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new Error(`Ошибка при создании платежа: ${errorMessage}`);
    }
  }

  /**
   * Обновляет статус оплаты по идентификатору транзакции.
   *
   * @param transactionId - Идентификатор транзакции (InvId).
   * @param status - Новый статус транзакции.
   * @returns ID обновлённой записи или null, если ничего не обновилось.
   */
  async changeStatus(
    transactionId: string,
    status: PaymentStatus,
  ): Promise<string | null> {
    const paidAt = DateTime.now().setZone('Europe/Moscow').toJSDate();
    const query = {
      name: 'change-status-payment',
      text: `
        UPDATE payments
        SET status = $2,
            paid_at = $3
        WHERE transaction_id = $1
        RETURNING id;
      `,
      values: [transactionId, status, paidAt],
    };

    try {
      const { rows } = await this.db.query(query);

      if (rows.length == 0) {
        this.logger.warn(
          `Транзакция с ID ${transactionId} не найдена для обновления`,
          this,
        );
        return null;
      }

      this.logger.log(
        `Статус оплаты обновлён: transactionId=${transactionId}, status=${status}`,
        this,
      );

      return transactionId;
    } catch (error) {
      this.logger.error(
        `Ошибка при обновлении статуса оплаты: ${(error as Error).message}`,
        this,
      );
      throw new Error('Ошибка при обновлении статуса оплаты');
    }
  }
}
