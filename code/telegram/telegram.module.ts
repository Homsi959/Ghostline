import { Module } from '@nestjs/common';
import { TelegramBotController } from './telegram.controller';
import { TelegramService } from './services/telegram.service';
import { TelegramHistoryService } from './services/telegram.history.service';

/**
 * Модуль для работы с Telegram-ботом.
 *
 * @remarks Этот модуль инкапсулирует всю логику, связанную с обработкой запросов от пользователей через Telegram-бота.
 * Он включает контроллер и сервис для работы с запросами и взаимодействия с Telegram API.
 */
@Module({
  providers: [TelegramBotController, TelegramService, TelegramHistoryService],
})
export class TelegramModule {}
