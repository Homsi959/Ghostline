import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { WinstonModule } from 'code/logger/winston.module';
import { WinstonService } from 'code/logger/winston.service';
import { DatabaseModule } from 'code/database/database.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { TELEGRAM_TOKEN } from 'code/common/constants';
import { session } from 'telegraf';
import { TelegramModule } from 'code/telegram/telegram.module';

@Module({
  imports: [
    DatabaseModule,
    WinstonModule,
    TelegramModule,
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
  providers: [AppService],
})
export class AppModule {}
