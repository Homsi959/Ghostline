import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

import { TELEGRAM_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';

/**
 * Сервис для работы с ботом Telegram.
 */
@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  /**
   * Экземпляр бота Telegraf.
   */
  private bot: Telegraf;

  /**
   * Конструктор для создания экземпляра сервиса
   *
   * @param config - Сервис для доступа к конфигурационным данным (например, токен Telegram)
   * @param logger - Сервис для логирования сообщений и ошибок
   */
  constructor(
    private config: ConfigService, // Получаем доступ к конфигурационным данным
    private readonly logger: WinstonService, // Логирование ошибок и событий
  ) {}

  /**
   * Метод, который вызывается после инициализации модуля.
   * Здесь настраивается бот и запускаются основные команды.
   */
  onModuleInit() {
    // Получаем токен Telegram из конфигурации
    const token = this.config.get<string>(TELEGRAM_TOKEN);

    // Если токен отсутствует, логируем ошибку и выходим
    if (!token) {
      this.logger.error(
        `[TelegramService.onApplicationBootstrap] - 
          Отсутствует токен для Telegram. Пожалуйста, укажите его в .env файле.`,
      );
      return;
    }

    // Создаём новый экземпляр бота с полученным токеном
    this.bot = new Telegraf(token);

    // Настройка команды /start
    this.bot.start((ctx) => ctx.reply('Привет! Я твой NestJS-бот 🤖'));

    // Настройка команды /help
    this.bot.help((ctx) =>
      ctx.reply('Список команд:\n/start - Запуск\n/help - Помощь'),
    );

    try {
      void this.bot.launch();
      this.logger.log(
        `[TelegramService.onApplicationBootstrap] - Бот успешно запущен.`,
      );
    } catch (error: any) {
      this.logger.error(
        `[TelegramService.onApplicationBootstrap] - Ошибка запуска бота: ${error}`,
      );
    }
  }

  /**
   * Метод, вызываемый при уничтожении модуля.
   * Останавливает бота и логирует это действие.
   */
  onModuleDestroy() {
    if (this.bot) {
      this.bot.stop();
      this.logger.log(`[TelegramService.onModuleDestroy] - Бот остановлен.`);
    }
  }
}
