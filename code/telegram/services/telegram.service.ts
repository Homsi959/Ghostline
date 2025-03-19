import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'code/database/repository/users.repository';
import { TelegramProfilesRepository } from 'code/database/repository/telegramProfiles.repository';
import { WinstonService } from 'code/logger/winston.service';
import { addGoBackButton, buildInlineKeyboard } from 'code/common/utils';
import { PAGE_KEYS, telegramPages } from '../common/telegram.pages';
import { Context } from 'code/common/types';
import { TelegramHistoryService } from './telegram.history.service';
import {
  CreateTelegramProfileDto,
  toTelegramProfileDto,
} from '../common/telegram.dto';

/**
 * Сервис для работы с Telegram-ботом.
 * Обрабатывает запросы от пользователей, управляет рендерингом страниц,
 * сохраняет историю страниц в сессии, а также управляет данными пользователей.
 */
@Injectable()
export class TelegramService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly tgProfilesRepo: TelegramProfilesRepository,
    private readonly logger: WinstonService,
    private readonly historyService: TelegramHistoryService,
  ) {}

  /**
   * Обрабатывает старт бота: создает пользователя и отправляет приветственное сообщение.
   * @param context - Контекст Telegraf
   */
  async startBot(context: Context): Promise<void> {
    const { from } = context;

    this.logger.log(`Бот запущен пользователем: ${context.from?.id}`, this);
    if (from) {
      const telegramProfileDto = await toTelegramProfileDto(from);
      await this.ensureUserExists(telegramProfileDto);
    }
    await this.renderPage(context, PAGE_KEYS.MAIN_PAGE);
  }

  /**
   * Отображает указанную страницу в чате.
   * Если метод вызывается не через callback, отправляет новое сообщение.
   * В противном случае изменяет текст существующего сообщения.
   *
   * @param context - Контекст Telegraf, содержащий информацию о чате и пользователе.
   * @param page - Ключ страницы, которую нужно отобразить.
   * @throws Ошибку, если контекст отсутствует.
   */
  async renderPage(context: Context, page: string): Promise<void> {
    const { message, keyboardConfig, goBackButton } = telegramPages[page];
    let buttons = keyboardConfig
      ? buildInlineKeyboard(keyboardConfig.buttons, keyboardConfig.columns)
      : undefined;

    if (!context) {
      this.logger.error(`Контекст отсутствует`, this);
      throw new Error('Контекст отсутствует');
    }

    if (goBackButton) {
      buttons = addGoBackButton(buttons);
    }

    if (!context.callbackQuery) {
      // Отправляем новое сообщение, если метод вызван не через callback
      await context.reply(message, buttons);
      this.logger.log(`Отправлено новое сообщение со страницей: ${page}`, this);
    } else {
      // Изменяем существующее сообщение, если метод вызван через callback
      await context.editMessageText(message, buttons);
      this.logger.log(`Отрисована страница: ${page}`, this);
    }

    // Сохраняем отрисованную страницу
    this.historyService.savePageHistory(context.session.pageHistory, page);
  }

  /**
   * Проверяет, существует ли Telegram-профиль пользователя в БД.
   * Если профиль отсутствует, создаёт нового пользователя и Telegram-профиль.
   *
   * @param context - Контекст Telegraf, содержащий информацию о пользователе.
   */
  private async ensureUserExists(
    telegramProfile: CreateTelegramProfileDto,
  ): Promise<void> {
    const { telegramId } = telegramProfile;
    // Проверяем, существует ли Telegram-профиль пользователя в БД
    const telegramIdFromDB =
      await this.tgProfilesRepo.getTelegramProfileById(telegramId);

    // Если профиль отсутствует, создаём нового пользователя
    if (!telegramIdFromDB) {
      const user = await this.usersRepo.createUser();

      // Создаём Telegram-профиль только если удалось создать пользователя
      if (user) {
        const savedTelegramProfile = {
          userId: user.id,
          ...telegramProfile,
        };

        await this.tgProfilesRepo.createTelegramProfile(savedTelegramProfile);
      }
    }
  }

  /**
   * Отображает предыдущую страницу из истории сессии.
   * Если история пуста или в ней только одна страница, то ничего не происходит.
   *
   * @param context - Объект контекста, содержащий данные callback-запроса.
   */
  async goBackRender(context: Context) {
    const prevPage = this.historyService.getPreviousPage(context);
    if (!prevPage) {
      this.logger.error(`История страниц пуста`, this);
      return;
    }

    await this.renderPage(context, prevPage);
  }

  /**
   * Удаляет указанное сообщение по ID.
   * @param context - Контекст Telegraf с сессией
   * @param messageId - ID сообщения, которое необходимо удалить
   */
  private async deleteMessage(
    context: Context,
    messageId: number,
  ): Promise<boolean> {
    if (!messageId) return false;

    try {
      await context.deleteMessage(messageId);
      this.logger.log(`Удалено сообщение с ID: ${messageId}`, this);
      return true;
    } catch (error) {
      this.logger.error(
        `Не удалось удалить сообщение с ID: ${messageId}`,
        this,
        error,
      );
      return false;
    }
  }
}
