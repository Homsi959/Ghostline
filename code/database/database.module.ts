import { Module, Global } from '@nestjs/common';
import { CONFIG_PROVIDER_TOKEN, DATABASE_TOKEN } from 'code/common/constants';
import { Pool } from 'pg';
import {
  SubscriptionDao,
  TelegramProfilesDao,
  UsersDao,
  VpnAccountsDao,
  PaymentsDao,
} from 'code/database/dao';
import { AppConfig } from 'code/config/types';

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
      inject: [CONFIG_PROVIDER_TOKEN],
      useFactory: (config: AppConfig) => {
        return new Pool({
          host: config.db.host,
          port: config.db.port,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
        });
      },
    },
    UsersDao,
    TelegramProfilesDao,
    SubscriptionDao,
    VpnAccountsDao,
    PaymentsDao,
  ],
  exports: [
    UsersDao,
    TelegramProfilesDao,
    SubscriptionDao,
    VpnAccountsDao,
    PaymentsDao,
    DATABASE_TOKEN,
  ],
})
export class DatabaseModule {}
