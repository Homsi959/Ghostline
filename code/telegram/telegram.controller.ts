import { Start, Hears, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';
import { BUTTONS } from './common/telegram.buttons';

@Update()
export class TelegramBotController {
  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Метод, вызываемый при старте бота.
   * Отправляет приветственное сообщение и отображает главное меню.
   * @param ctx - Контекст Telegraf
   */
  @Start()
  async start(ctx: Context): Promise<void> {
    await this.telegramService.startBot(ctx);
  }

  /**
   * Метод, вызываемый при нажатии кнопки "Главное меню".
   * Отправляет информацию о сервере и отображает кнопки для покупки подписки, обновления статуса и перехода на канал.
   * @param ctx - Контекст Telegraf
   */
  @Hears(BUTTONS.MAIN_MENU)
  async getMenu(ctx: Context): Promise<void> {}
}
