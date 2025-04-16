import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { CreateTransaction, Transaction } from '../common/types';
import { PaymentEntity } from '../common/entities';
import { PaymentStatus } from '../common/enums';

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
   * Ищет транзакцию по её идентификатору (transaction_id).
   * Используется для обработки уведомлений от платёжных систем (например, Robokassa).
   *
   * @param id - Уникальный идентификатор транзакции (transaction_id)
   * @returns Объект транзакции или null, если не найдено
   * @throws Ошибка, если запрос к базе завершился с ошибкой
   */
  async findByTransactionId(id: string): Promise<Transaction | null> {
    const query = {
      name: 'find-by-transaction-id',
      text: `
      SELECT * 
      FROM payments
      WHERE transaction_id = $1
    `,
      values: [id],
    };

    try {
      const { rows } = await this.db.query<PaymentEntity>(query);

      if (rows.length == 0) return null;

      const row = rows[0];
      const transaction: Transaction = {
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

      return transaction;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Не удалось получить транзакцию из БД (id=${id}): ${errorMessage}`,
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
}
