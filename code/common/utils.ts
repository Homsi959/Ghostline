import { Context, Markup } from 'telegraf';
import { TButtons } from './types';
import { telegramPages } from 'code/telegram/common/telegram.menu';

/**
 * Конвертирует массив кнопок в Telegram клавиатуру
 *
 * @param arr - Массив кнопок
 * @returns - Telegram клавиатура
 */
export function buildInlineKeyboard(arr: TButtons[]) {
  const keyboard = arr.map(({ text, action }) =>
    Markup.button.callback(text, action),
  );

  return Markup.inlineKeyboard(keyboard);
}

// TODO узнать, хорошо ли выносить бизнес логику за пределы телеграм сервиса
export async function RenderPage(
  context: Context,
  page: string,
): Promise<void> {
  const { message, buttons } = telegramPages[page];

  if (!context) {
    // TODO добавить ошбику в лог
    throw new Error('Контекст отсутствует');
  }

  if (!context.callbackQuery) {
    await context.reply(message, buttons && buildInlineKeyboard(buttons));
  } else {
    await context.editMessageText(
      message,
      buttons && buildInlineKeyboard(buttons),
    );
  }
}
