import { Start, Update, Action } from 'nestjs-telegraf';
import { WinstonService } from 'code/logger/winston.service';
import { Context } from 'code/common/types';
import { ACTIONS_KEYS, PURCHASE_ACTIONS } from './common/telegram.actions';
import { TelegramService, TelegramSubscribingService } from './services';

/**
 * Контроллер для обработки событий в Telegram-боте.
 *
 * @remarks Обрабатывает стартап бота, рендеринг страниц и действие "Назад".
 */
@Update()
export class TelegramBotController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly subscribingService: TelegramSubscribingService,
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
      this.logger.error(`Отсутствует data в callbackQuery`, this);
      return;
    }
    const page = context.callbackQuery?.data;

    await this.telegramService.renderPage(context, page);
  }

  /**
   * Обработчик действия "Назад".
   * Проверяет наличие данных в callbackQuery и вызывает метод для отображения предыдущей страницы.
   *
   * @param context - Контекст, содержащий callbackQuery.
   */
  @Action(ACTIONS_KEYS.GO_BACK)
  async goBack(context: Context) {
    if (!(context.callbackQuery && 'data' in context.callbackQuery)) {
      this.logger.error(`Отсутствует data в callbackQuery`, this);
      return;
    }

    await this.telegramService.goBackRender(context);
  }

  /**
   * Обработчик действия "Назад".
   * Проверяет наличие данных в callbackQuery и вызывает метод для отображения предыдущей страницы.
   *
   * @param context - Контекст, содержащий callbackQuery.
   */
  @Action(PURCHASE_ACTIONS)
  async handlePurchase(context: Context) {
    const callback = context.callbackQuery;

    if (!(callback && 'data' in callback)) {
      this.logger.error(`Отсутствует data в callbackQuery`, this);
      return;
    }

    switch (callback.data) {
      case ACTIONS_KEYS.ACTIVATE_TRIAL:
        await this.subscribingService.activateTrial();
        break;
      // case ACTIONS_KEYS.BUY_FOR_1_MONTH:
      //   break;
      // case ACTIONS_KEYS.BUY_FOR_6_MONTHS:
      //   break;

      default:
        break;
    }
  }
}
