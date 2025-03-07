import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';

@Injectable()
export class UsersRepository {
  /**
   * @param db - Пул подключений к базе данных.
   * @param logger - Сервис логирования.
   */
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Pool,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Создание пользователя в таблице Users.
   *
   * @returns {number | undefined} - ID нового пользователя или undefined в случае неудачи.
   */
  public async createUser(): Promise<number | undefined> {
    try {
      const query = `INSERT INTO users
                    DEFAULT VALUES 
                    RETURNING id`;
      const result = await this.db.query(query);
      const newUserID = result.rows[0].id as number;

      if (newUserID) {
        this.logger.log(
          `[UsersRepository.createUser] - Создан новый пользователь c ID: ${newUserID}`,
        );

        return newUserID;
      } else {
        return undefined;
      }
    } catch (error: any) {
      this.logger.error(
        `[UsersRepository.createUser] - Ошибка при создании пользователя: ${error.message}`,
        error,
      );
      throw new Error(`Ошибка при создании пользователя в Users`);
    }
  }
}
