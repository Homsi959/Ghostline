import { Start, Update, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';

@Update()
export class TelegramBotController {
  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Метод, вызываемый при старте бота.
   * Отправляет приветственное сообщение и отображает главное меню.
   * @param context - Контекст Telegraf
   */
  @Start()
  async start(context: Context): Promise<void> {
    await this.telegramService.startBot(context);
  }

  @Action(/^.*Page$/g)
  async renderPage(context: Context): Promise<void> {
    // TODO красивое ли решение?
    if (!(context.callbackQuery && 'data' in context.callbackQuery)) return;
    const page = context.callbackQuery?.data;

    await this.telegramService.renderPage(context, page);
  }
}
