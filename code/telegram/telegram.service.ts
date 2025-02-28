import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TELEGRAM_TOKEN } from 'code/common/constants';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  /**
   * Создаёт экземпляр сервиса
   *
   * @param config параметры соединения
   */
  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const token = this.config.get<string>(TELEGRAM_TOKEN);

    if (!token) {
      //   this.logger.error(
      //     `[TelegramService] - TelegramService is not initialized. Token is not provided.`,
      //   );
      return;
    }

    this.bot = new Telegraf(token);

    this.bot.start((ctx) => ctx.reply('Привет! Я твой NestJS-бот 🤖'));
    this.bot.help((ctx) =>
      ctx.reply('Список команд:\n/start - Запуск\n/help - Помощь'),
    );

    await this.bot.launch();
  }
}
