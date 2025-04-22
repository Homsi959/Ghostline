import { BUTTONS } from 'code/telegram/common/telegram.pages';
import { Markup } from 'telegraf';
import { InlineKeyboardButton, InlineKeyboardMarkup } from 'telegraf/types';
import { BuildInlineKeyboardOptions } from './types';

/**
 * Создаёт Telegram клавиатуру из массива кнопок с заданным количеством колонок.
 * Подставляет переменные из payload в шаблоны кнопок.
 *
 * @param arr - Массив кнопок.
 * @param columns - Количество колонок (по умолчанию 1).
 * @param payload - Данные для подстановки в шаблоны кнопок.
 * @returns - Telegram клавиатура.
 */
export function buildInlineKeyboard({
  arr,
  columns = 1,
  payload,
}: BuildInlineKeyboardOptions): Markup.Markup<InlineKeyboardMarkup> {
  const flatPayload: Record<string, string | number | boolean> = flattenObject(
    payload ?? {},
  );

  const keyboard: InlineKeyboardButton[][] = arr.reduce((acc, item, index) => {
    const columnIndex = Math.floor(index / columns);

    const replacedButton: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'string') {
        const replacedValue = value.replace(
          /{{(.*?)}}/g,
          (_match, keyName: string) => {
            const replacement = flatPayload[keyName];
            return replacement !== undefined ? String(replacement) : '';
          },
        );
        replacedButton[key] = replacedValue;
      }
    }

    if (!acc[columnIndex]) {
      acc[columnIndex] = [];
    }

    if (!replacedButton.url && !replacedButton.action) {
      console.warn(`❌ Кнопка без действия: ${JSON.stringify(item)}`);
      return acc;
    }

    const button = replacedButton.url
      ? Markup.button.url(replacedButton.text, replacedButton.url)
      : Markup.button.callback(
          replacedButton.text,
          replacedButton.action ?? '',
        );

    acc[columnIndex].push(button);
    return acc;
  }, [] as InlineKeyboardButton[][]);

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
    Markup.button.callback(BUTTONS.GO_BACK.text, BUTTONS.GO_BACK.action || ''),
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

  return typeof classInstanceOrString == 'string'
    ? classInstanceOrString
    : classInstanceOrString.constructor.name;
}

/**
 * Форматирует уровень логирования для выравнивания и удаления цветовых escape-последовательностей.
 *
 * @param level - Уровень логирования (например, "info", "warn", "error").
 * @returns Отформатированный уровень логирования в квадратных скобках, дополненный пробелами до 9 символов.
 */
export function levelFormatted(level: string): string {
  const normalizedLevel = level.replace(/\u001b\[.*?m/g, '').toUpperCase(); // удаление escape-последовательностей
  const formatedLevel = `[${normalizedLevel}]`;
  return formatedLevel.padEnd(9);
}

/**
 * Преобразует вложенный объект в плоский объект с ключами через точку.
 *
 * @param obj - Вложенный объект.
 * @param result - Внутренний параметр для накопления результата.
 * @returns Плоский объект с путями в виде ключей.
 */
export function flattenObject(
  obj: Record<string, any>,
  result: Record<string, any> = {},
): Record<string, any> {
  for (const [key, value] of Object.entries(obj)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        flattenObject(value as Record<string, any>, result);
      }
    } else {
      result[key] = value as unknown;
    }
  }

  return result;
}
