import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { v4 } from 'uuid';

/**
 * DAO пользователей.
 */
@Injectable()
export class UsersDao {
  /**
   * @param logger - сервис логирования.
   * @param db - соеденение с БД.
   */
  constructor(
    private readonly logger: WinstonService,
    @Inject(DATABASE_TOKEN) private readonly db: Pool,
  ) {}

  /**
   * Создает нового пользователя.
   * @returns uuid пользователя.
   */
  async createUser(): Promise<string> {
    const uuid = v4();
    const query = {
      name: 'create-user',
      text: `
      INSERT INTO users (id)
      VALUES ($1)
    `,
      values: [uuid],
    };

    try {
      await this.db.query(query);
      this.logger.log(`✅ Создан пользователь с ID: ${uuid}`, this);

      return uuid;
    } catch (error: any) {
      this.logger.error(
        `Ошибка при создании пользователя: ${error.message}`,
        this,
        error,
      );
      throw new Error(`Не удалось создать пользователя`);
    }
  }
}
