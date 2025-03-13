import { Markup } from 'telegraf';
import { TButtons } from './types';

/**
 * Конвертирует массив кнопок в Telegram клавиатуру
 *
 * @param arr - Массив кнопок
 * @returns - Telegram клавиатура
 */
export function buildInlineKeyboard(arr: TButtons[], columns: number = 1) {
  const keyboard = arr.map(({ text, action }) =>
    Markup.button.callback(text, action),
  );

  return Markup.inlineKeyboard(keyboard, {
    columns,
  });
}
