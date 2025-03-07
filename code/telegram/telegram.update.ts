import { Hears, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { UsersRepository } from 'code/database/repository/users.repository';
import { BUTTONS } from './telegram.buttons';
import { MESSAGES } from './telegram.messages';

@Update()
export class TelegramUpdate {
  constructor(private readonly userRepository: UsersRepository) {}

  /**
   * Метод, вызываемый при старте бота.
   * Отправляет приветственное сообщение и отображает главное меню.
   * @param ctx - Контекст Telegraf
   */
  @Start()
  async start(ctx: Context) {
    if ('message' in ctx.update) {
      const user = ctx.update.message.from;

      await this.userRepository.createUser(user);
    }

    await ctx.reply(
      MESSAGES.WELCOME,
      Markup.keyboard([BUTTONS.MAIN_MENU]).resize(),
    );
    await this.getMenu(ctx);
  }

  /**
   * Метод, вызываемый при нажатии кнопки "Главное меню".
   * Отправляет информацию о сервере и отображает кнопки для покупки подписки, обновления статуса и перехода на канал.
   * @param ctx - Контекст Telegraf
   */
  @Hears(BUTTONS.MAIN_MENU)
  async getMenu(ctx: Context) {
    await ctx.reply(
      MESSAGES.SERVER_INFO,
      Markup.inlineKeyboard([
        [Markup.button.url('💎 Купить подписку', 'https://your-vpn-link.com')],
        [Markup.button.callback('🔄 Обновить статус', 'update_status')],
        [Markup.button.url('📢 Наш канал', 'https://t.me/YouFastVPN')],
      ]),
    );
  }

  // @On('text')
  // async getMessage(@Message('text') text: string, @Ctx() ctx: Context) {
  //   console.log(text);
  // }
}
