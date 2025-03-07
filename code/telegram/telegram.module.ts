import { Module } from '@nestjs/common';
import { TelegramBotController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  providers: [TelegramBotController, TelegramService],
})
export class TelegramModule {}
