import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { UsersRepository } from './repository/users.repository';
import { DATABASE_TOKEN } from 'code/common/constants';
import { TelegramProfilesRepository } from './repository/telegramProfiles.repository';

/**
 * Модуль, отвечающий за настройку и подключение к базе данных.
 * Включает провайдеры для работы с базой данных и репозиториями.
 */
@Global()
@Module({
  imports: [ConfigModule],
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
    UsersRepository,
    TelegramProfilesRepository,
  ],
  exports: [UsersRepository, TelegramProfilesRepository, DATABASE_TOKEN],
})
export class DatabaseModule {}
