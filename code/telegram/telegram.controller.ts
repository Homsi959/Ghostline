import { Start, Update, Action } from 'nestjs-telegraf';
import { WinstonService } from 'code/logger/winston.service';

import {
  ACTIONS_KEYS,
  ACTIONS_TO_SUBSCRIPTION,
  PURCHASE_ACTIONS,
} from './common/telegram.actions';
import { TelegramService } from './services';
import { Context } from './common/telegram.types';

/**
 * Контроллер для обработки событий в Telegram-боте.
 *
 * @remarks Обрабатывает стартап бота, рендеринг страниц и действие "Назад".
 */
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
   * Обрабатывает покупку подписки из Telegram-кнопок.
   *
   * @param context - Контекст Telegram.
   */
  @Action(PURCHASE_ACTIONS)
  async handlePurchase(context: Context) {
    const callback = context.callbackQuery;

    if (!(callback && 'data' in callback)) {
      this.logger.error(
        `Отсутствует data (то есть action) в callbackQuery`,
        this,
      );
      return;
    }

    if (!(callback && 'from' in callback)) {
      this.logger.error(`Отсутствует from в callbackQuery`, this);
      return;
    }

    const { data: action } = callback;
    const { id: telegramId } = context.callbackQuery.from;
    const plan = ACTIONS_TO_SUBSCRIPTION[action];

    if (!plan) {
      this.logger.error(`Некорректный action: ${action}`, this);
      return;
    }

    await this.telegramService.subscribe({
      context,
      telegramId,
      plan,
    });
  }
}
