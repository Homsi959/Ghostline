import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { Pool } from 'pg';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Pool) {}

  public async createUser(telegramId: number): Promise<void> {}
  public async getUserByTelegramId(telegramId: number) {}
  public async getUserById(id: number) {}
}
