import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { VpnAccount } from '../common/types';
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
  async getAllVpnAccounts(): Promise<VpnAccount[] | null> {
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
        flow: acc.flow ?? null,
      }));

      return accounts;
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(`Не удалось получить VPN аккаунты: ${errMsg}`, this);
      return null;
    }
  }
}
