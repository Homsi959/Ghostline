import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { CreateVpnAccount, VpnAccount } from '../common/types';
import { VpnAccountEntity } from '../common/entities';

/**
 * DAO VPN аккаунтов.
 */
@Injectable()
export class VpnAccountsDao {
  /**
   * @param logger - сервис логирования.
   * @param db - соеденение с БД.
   */
  constructor(
    private readonly logger: WinstonService,
    @Inject(DATABASE_TOKEN) private readonly db: Pool,
  ) {}

  /**
   * Получает список всех VPN-аккаунтов из базы данных.
   * @returns Массив объектов VPN-аккаунтов или null, если ничего не найдено.
   */
  async findAll(): Promise<VpnAccount[] | null> {
    const query = {
      name: 'get-all-vpn_accounts',
      text: `SELECT * FROM vpn_accounts`,
    };

    try {
      const { rows } = await this.db.query<VpnAccountEntity>(query);

      if (rows.length == 0) {
        return null;
      }

      const accounts = rows.map((acc) => ({
        server: acc.server,
        port: acc.port,
        publicKey: acc.public_key,
        sni: acc.sni,
        createdAt: acc.created_at,
        userId: acc.user_id,
        flow: acc.flow,
        isBlocked: acc.is_blocked,
        devicesLimit: acc.devices_limit,
      }));

      return accounts;
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(`Не удалось получить VPN аккаунты: ${errMsg}`, this);
      return null;
    }
  }

  /**
   * Создаёт новый VPN-аккаунт в базе данных.
   *
   * @returns true, если успешно добавлен, иначе выбрасывает исключение.
   */
  async create({
    userId,
    sni,
    server,
    publicKey,
    port,
    isBlocked,
    flow,
    devicesLimit,
  }: CreateVpnAccount): Promise<boolean> {
    const values = [
      server,
      port,
      publicKey,
      sni,
      userId,
      flow,
      isBlocked,
      devicesLimit,
    ];

    const query = {
      name: 'create-vpn_account',
      text: `INSERT INTO vpn_accounts (
            server,
            port,
            public_key,
            sni,
            user_id,
            flow,
            is_blocked,
            devices_limit
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      values,
    };

    try {
      await this.db.query(query);
      return true;
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(
        `Ошибка при создании VPN-аккаунта: ${errMsg}. Данные: ${JSON.stringify({
          server,
          port,
          publicKey,
          sni,
          userId,
          flow,
          isBlocked,
          devicesLimit,
        })}`,
        this,
      );
      throw new Error('Не удалось создать VPN-аккаунт');
    }
  }

  /**
   * Обновляет статус блокировки VPN-аккаунта пользователя.
   *
   * @param userId - Идентификатор пользователя.
   * @param isBlocked - Статус блокировки (true — заблокирован, false — разблокирован).
   * @returns true, если статус успешно обновлён, иначе false.
   */
  async toggleVpnAccountBlock(
    userId: string,
    isBlocked: boolean,
  ): Promise<boolean> {
    const query = {
      name: 'update-vpn-account-block-status',
      text: `
        UPDATE vpn_accounts
        SET is_blocked = $2
        WHERE user_id = $1
        RETURNING id;
      `,
      values: [userId, isBlocked],
    };

    try {
      const { rows } = await this.db.query(query);

      if (rows.length === 0) {
        this.logger.warn(
          `VPN-аккаунт для userId=${userId} не найден при попытке обновить is_blocked=${isBlocked}`,
          this,
        );
        return false;
      }

      this.logger.log(
        `VPN-аккаунт обновлён: userId=${userId}, is_blocked=${isBlocked}`,
        this,
      );
      return true;
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(
        `Ошибка при обновлении блокировки VPN-аккаунта (userId=${userId}): ${errMsg}`,
        this,
      );
      return false;
    }
  }
}
