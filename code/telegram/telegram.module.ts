import { Module } from '@nestjs/common';
import { TelegramBotController } from './telegram.controller';
import { TelegramService } from './telegram.service';

/**
 * Модуль для работы с Telegram-ботом.
 *
 * @remarks Этот модуль инкапсулирует всю логику, связанную с обработкой запросов от пользователей через Telegram-бота.
 * Он включает контроллер и сервис для работы с запросами и взаимодействия с Telegram API.
 */
@Module({
  providers: [TelegramBotController, TelegramService],
})
export class TelegramModule {}
