import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TelegramBotController } from './telegram.controller';
import { TelegramHistoryService, TelegramService } from './services';
import { DatabaseModule } from 'code/database/database.module';
import { XrayModule } from 'code/xray/xray.module';
import { PaymentsModule } from 'code/payments/payments.module';
import { SubscriptionModule } from 'code/subscription/subscription.module';

/**
 * Модуль для работы с Telegram-ботом.
 *
 * @remarks Этот модуль инкапсулирует всю логику, связанную с обработкой запросов от пользователей через Telegram-бота.
 * Он включает контроллер и сервис для работы с запросами и взаимодействия с Telegram API.
 */
@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    XrayModule,
    PaymentsModule,
    SubscriptionModule,
  ],
  providers: [TelegramBotController, TelegramService, TelegramHistoryService],
})
export class TelegramModule {}
