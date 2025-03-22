import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { v4 } from 'uuid';

/**
 * Репозиторий пользователей.
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
   * @returns сохранённую сущность пользователя.
   */
  async createUser(): Promise<any> {
    const values = { id: v4() };

    try {
      this.logger.log(`Cоздан пользователь с ID: ${values.id}`, this);
    } catch (error: any) {
      throw new Error(`Не удалось создать пользователя`, error);
    }
  }
}
