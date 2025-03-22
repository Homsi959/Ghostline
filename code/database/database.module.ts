import { Module, Global } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import {
  SubscriptionDao,
  TelegramProfilesDao,
  UsersDao,
} from 'code/database/dao';

/**
 * Глобальный модуль базы данных.
 *
 * Этот модуль настраивает подключение к PostgreSQL,
 * загружая переменные окружения из соответствующего файла (.env.development или .env.production).
 * Он также предоставляет репозитории для работы с сущностями.
 */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Pool({
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          user: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
        });
      },
    },
    UsersDao,
    TelegramProfilesDao,
    SubscriptionDao,
  ],
  exports: [UsersDao, TelegramProfilesDao, SubscriptionDao, DATABASE_TOKEN],
})
export class DatabaseModule {}
