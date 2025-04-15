import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { Transaction } from '../common/types';
import { PaymentEntity } from '../common/entities';

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
      values: [id], // 👈 исправлено (value → values)
    };

    try {
      const { rows } = await this.db.query<PaymentEntity>(query);

      if (rows.length == 0) return null;

      const row = rows[0];
      const transaction: Transaction = {
        ...row,
        paymentMethod: row.payment_method,
        transactionId: row.transaction_id,
        createdAt: row.created_at,
        userId: row.user_id,
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
}
