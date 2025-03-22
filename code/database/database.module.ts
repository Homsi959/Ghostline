import { Module, Global } from '@nestjs/common';
import { UsersRepository } from './repository/users.repository';
import { TelegramProfilesRepository } from './repository/telegramProfiles.repository';
import { SubscriptionRepository } from './repository/subscription.repository';

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
    UsersRepository,
    TelegramProfilesRepository,
    SubscriptionRepository,
  ],
  exports: [
    UsersRepository,
    TelegramProfilesRepository,
    SubscriptionRepository,
  ],
})
export class DatabaseModule {}
