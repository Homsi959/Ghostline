import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TELEGRAM_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  /**
   * Создаёт экземпляр сервиса
   *
   * @param config параметры соединения
   * @param logger сервис логирования
   */
  constructor(
    private config: ConfigService,
    private readonly logger: WinstonService,
  ) {}

  async onModuleInit() {
    const token = this.config.get<string>(TELEGRAM_TOKEN);

    if (!token) {
      this.logger.error(
        `[TelegramService.onModuleInit] - Отсутствует токен для Telegram. Пожалуйста, укажите его в .env файле.`,
      );
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
