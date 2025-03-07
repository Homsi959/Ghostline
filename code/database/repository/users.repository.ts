import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { User } from 'telegraf/types';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Pool,
    private readonly logger: WinstonService,
  ) {}

  public async createUser(user: User): Promise<boolean> {
    const query = `
      INSERT INTO users (telegram_id)
      VALUES ($1)
      ON CONFLICT (telegram_id) DO NOTHING
    `;

    try {
      await this.db.query(query, [user.id]);
      this.logger.log(
        `[UsersRepository.createUser] - Пользователь создан: ${user.id}`,
      );
      return true;
    } catch (error) {
      console.error('Error while creating user:', error);
      return false;
    }
  }

  public async getUserByTelegramId(telegramId: number) {}
  public async getUserById(id: number) {}
}
