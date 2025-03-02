import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';

/**
 * Модуль для работы с ботом Telegram.
 */
@Module({
  providers: [TelegramService],
})
export class TelegramModule {}
