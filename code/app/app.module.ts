import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'code/logger/winston.module';
import { WinstonService } from 'code/logger/winston.service';
import { DatabaseModule } from 'code/database/database.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { TELEGRAM_TOKEN } from 'code/common/constants';
import { session } from 'telegraf';
import { TelegramModule } from 'code/telegram/telegram.module';
import { HttpModule } from '@nestjs/axios';

/**
 * Основной модуль приложения.
 *
 * Включает в себя все необходимые модули, такие как:
 * - DatabaseModule: Для работы с базой данных.
 * - WinstonModule: Для логирования с использованием Winston.
 * - TelegramModule: Для работы с Telegram-ботом.
 * - ConfigModule: Для работы с конфигурационными переменными.
 * - TelegrafModule: Для работы с Telegram API с использованием Telegraf.
 * - HttpModule: Для работы с Axios.
 *
 * @module AppModule
 */
@Module({
  imports: [
    DatabaseModule,
    WinstonModule,
    TelegramModule,
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule, WinstonModule],
      inject: [ConfigService, WinstonService],
      useFactory: (configService: ConfigService, logger: WinstonService) => {
        const token = configService.get<string>(TELEGRAM_TOKEN);

        if (!token) {
          logger.error('TELEGRAM_TOKEN не найден в .env');
          throw new Error('TELEGRAM_TOKEN не найден в .env');
        }

        return {
          token,
          middlewares: [session()],
        };
      },
    }),
  ],
})
export class AppModule {}
