import { Start, Update, Action } from 'nestjs-telegraf';
import { WinstonService } from 'code/logger/winston.service';

import {
  ACTIONS_KEYS,
  ACTIONS_TO_SUBSCRIPTION,
  PURCHASE_ACTIONS,
} from './common/telegram.actions';
import { TelegramService } from './services';
import { Context } from './common/telegram.types';
import { PaidSubscriptionPlan } from 'code/database/common/enums';

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
    const page = context.callbackQuery.data;

    await this.telegramService.renderProtectedPage(context, page);
  }

  /**
   * Обработчик действия "Назад".
   * Проверяет наличие данных в callbackQuery и вызывает метод для отображения предыдущей страницы.
   *
   * @param context - Контекст, содержащий callbackQuery.
   */
  @Action(ACTIONS_KEYS.GO_BACK)
  async goBack(context: Context) {
    await this.telegramService.goBackRender(context);
  }

  /**
   * Обрабатывает покупку подписки из Telegram-кнопок.
   *
   * @param context - Контекст Telegram.
   */
  @Action(PURCHASE_ACTIONS)
  async handlePurchase(context: Context) {
    const { data: action } = context.callbackQuery;
    const { id: telegramId } = context.callbackQuery.from;
    const plan = ACTIONS_TO_SUBSCRIPTION[action] as PaidSubscriptionPlan;

    if (!plan) {
      this.logger.error(`Некорректный action: ${action}`, this);
      return;
    }

    await this.telegramService.initiateSubscriptionPayment({
      telegramId,
      plan,
      context,
    });
  }

  @Action(ACTIONS_KEYS.ACTIVATE_TRIAL)
  async getTrial(context: Context) {
    const { id: telegramId } = context.callbackQuery.from;

    await this.telegramService.activateTrialAccess({
      telegramId,
      context,
    });
  }

  @Action(ACTIONS_KEYS.CHECK_PAYMENT)
  async checkPayment(context: Context) {
    await this.telegramService.handlePaymentCheck(context);
  }
}
