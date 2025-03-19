import { BUTTONS } from 'code/telegram/common/telegram.pages';
import { TelegramButton } from 'code/telegram/common/telegram.types';
import { Markup } from 'telegraf';
import { InlineKeyboardButton, InlineKeyboardMarkup } from 'telegraf/types';

/**
 * Создаёт Telegram клавиатуру из массива кнопок с заданным количеством колонок.
 *
 * @param arr - Массив кнопок.
 * @param columns - Количество колонок (по умолчанию 1).
 * @returns - Telegram клавиатура.
 */
export function buildInlineKeyboard(
  arr: TelegramButton[],
  columns: number = 1,
): Markup.Markup<InlineKeyboardMarkup> {
  const keyboard = arr.reduce<InlineKeyboardButton[][]>((acc, item, index) => {
    // Находим индекс текущей колонки, деля на количество колонок
    const columnIndex = Math.floor(index / columns);

    // Если колонка еще не существует, создаем новый массив для нее
    if (!acc[columnIndex]) {
      acc[columnIndex] = [];
    }

    // Добавляем кнопку в соответствующую колонку
    acc[columnIndex].push(Markup.button.callback(item.text, item.action));
    return acc;
  }, []);

  return Markup.inlineKeyboard(keyboard);
}

/**
 * Добавляет кнопку "Назад" в клавиатуру.
 *
 * @param keyboard - Существующая Telegram клавиатура (опционально).
 * @returns - Новая клавиатура с добавленной кнопкой "Назад".
 */
export function addGoBackButton(
  keyboard?: Markup.Markup<InlineKeyboardMarkup>,
) {
  // Если клавиатуры нет, создаем пустую
  const keyboardArray = keyboard?.reply_markup.inline_keyboard || [];

  keyboardArray.push([
    Markup.button.callback(BUTTONS.GO_BACK.text, BUTTONS.GO_BACK.action),
  ]);

  return Markup.inlineKeyboard(keyboardArray);
}

/**
 * Возвращает название класса или переданную строку как контекст для логов.
 *
 * @param classInstanceOrString - экземпляр класса или строка контекста.
 * @returns название класса или переданную строку.
 */
export function buildContext(
  classInstanceOrString?: object | string,
): string | undefined {
  if (!classInstanceOrString) return undefined;

  return typeof classInstanceOrString === 'string'
    ? classInstanceOrString
    : classInstanceOrString.constructor.name;
}
