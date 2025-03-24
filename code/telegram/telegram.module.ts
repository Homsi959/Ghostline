import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TelegramBotController } from './telegram.controller';
import {
  TelegramHistoryService,
  TelegramService,
  TelegramSubscribingService,
} from './services';
import { DatabaseModule } from 'code/database/database.module';
import { XrayModule } from 'code/xray/xray.module';

/**
 * Модуль для работы с Telegram-ботом.
 *
 * @remarks Этот модуль инкапсулирует всю логику, связанную с обработкой запросов от пользователей через Telegram-бота.
 * Он включает контроллер и сервис для работы с запросами и взаимодействия с Telegram API.
 */
@Module({
  imports: [HttpModule, DatabaseModule, XrayModule],
  providers: [
    TelegramBotController,
    TelegramService,
    TelegramHistoryService,
    TelegramSubscribingService,
  ],
})
export class TelegramModule {}
