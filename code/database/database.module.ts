import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PaymentEntity,
  SubscriptionEntity,
  TelegramProfileEntity,
  UserEntity,
  VpnAccountEntity,
} from './entities';
import { TelegramProfilesRepository } from './repository/telegramProfiles.repository';
import { UsersRepository } from './repository/users.repository';
import { DEVELOPMENT } from 'code/common/constants';
import { SubscriptionRepository } from './repository/subscription.repository';

/**
 * Глобальный модуль базы данных.
 *
 * Этот модуль настраивает подключение к PostgreSQL с использованием TypeORM,
 * загружая переменные окружения из соответствующего файла (.env.development или .env.production).
 * Он также предоставляет репозитории для работы с сущностями User и TelegramProfile.
 */
@Global()
@Module({
  imports: [
    // Асинхронная настройка подключения к базе данных через TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // Автоматическая синхронизация включается только в дев-среде
        synchronize: process.env.NODE_ENV === DEVELOPMENT,
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        cli: {
          migrationsDir: 'src/migrations',
        },
        logging: false,
      }),
    }),
    // Регистрация сущностей для использования репозиториев TypeORM
    TypeOrmModule.forFeature([
      UserEntity,
      TelegramProfileEntity,
      PaymentEntity,
      SubscriptionEntity,
      VpnAccountEntity,
    ]),
  ],
  // Провайдеры, которые будут доступны глобально для работы с базой данных
  providers: [
    TelegramProfilesRepository,
    UsersRepository,
    SubscriptionRepository,
  ],
  exports: [
    TypeOrmModule,
    TelegramProfilesRepository,
    UsersRepository,
    SubscriptionRepository,
  ],
})
export class DatabaseModule {}
