import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_TOKEN } from '../database.module';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_TOKEN) private db: Pool) {}

  public async createUser(telegramId: number) {}
  public async getUserByTelegramId(telegramId: number) {}
  public async getUserById(id: number) {}
}
