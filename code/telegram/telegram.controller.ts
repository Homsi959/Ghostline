import { Start, Update, Action } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { WinstonService } from 'code/logger/winston.service';
import { ACTIONS_KEYS } from './common/telegram.pages';
import { Context } from 'code/common/types';

@Update()
export class TelegramBotController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Метод, вызываемый при старте бота.
   * Отправляет приветственное сообщение и отображает главное меню.
   * @param context - Контекст Telegraf
   */
  @Start()
  async start(context: Context): Promise<void> {
    await this.telegramService.startBot(context);
  }

  /**
   * Слушает callback запросы на названия с приставкой в конце - Page
   *
   * @param context - Объект контекста, содержащий данные callback-запроса.
   * @remarks - Если callback-запрос или его данные отсутствуют, записывается ошибка в лог и функция завершается.
   * @throws - Выбрасывает ошибку, если метод telegramService.renderPage завершится неудачно.
   */
  @Action(/^.*Page$/g)
  async renderPage(context: Context): Promise<void> {
    if (!(context.callbackQuery && 'data' in context.callbackQuery)) {
      this.logger.error(
        `[TelegramBotController.renderPage] - Отсутствует data в callbackQuery`,
      );
      return;
    }
    const page = context.callbackQuery?.data;

    await this.telegramService.renderPage(context, page);
  }

  @Action(ACTIONS_KEYS.GO_BACK)
  async goBackListener(context: Context) {
    if (!(context.callbackQuery && 'data' in context.callbackQuery)) {
      this.logger.error(
        `[TelegramBotController.renderPage] - Отсутствует data в callbackQuery`,
      );
      return;
    }

    await this.telegramService.goBackRender(context);
  }
}
