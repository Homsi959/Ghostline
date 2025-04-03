import { Context as TelegrafContext } from 'telegraf';

/**
 * Тип для описания кнопок Telegram, где можно выбрать либо action, либо url, но не оба одновременно.
 */
export type TelegramButton =
  | { text: string; action: string; url?: never }
  | { text: string; url: string; action?: never };

/**
 * Тип для конфигурации кнопок на странице Telegram.
 */
type TelegramButtonConfig = {
  buttons: TelegramButton[]; // Массив кнопок
  columns?: number; // Количество колонок на клавиатуре
};

/**
 * Тип для описания страницы Telegram.
 */
type TelegramPage = {
  message: PageMessage; // Сообщение, которое будет отображено на странице
  keyboardConfig?: TelegramButtonConfig; // Конфигурация клавиатуры с кнопками
  goBackButton?: boolean; // Опциональная кнопка "Назад"
};

/**
 * Тип для всех страниц Telegram.
 */
export type TelegramPages = {
  [key: string]: TelegramPage; // Ключ — это уникальное название страницы, значение — описание страницы
};

/**
 * Методы для работы с сообщениями бота.
 */
export type TelegramMessageContext = Pick<
  Context,
  'reply' | 'editMessageText' | 'callbackQuery'
>;

/** Сессия Telegram с историей отображаемых страниц. */
export type TelegramSession = {
  pageHistory: string[];
  payload: {
    vlessLink?: string;
  };
};

/** Расширенный интерфейс контекста Telegraf, добавляющий типизацию для сессии пользователя. */
export interface Context extends TelegrafContext {
  session: TelegramSession;
}

/** Сообщение страницы с текстом и необязательными переменными для подстановки */
type PageMessage = {
  text: string;
  dependencies?: string[];
};

/** Мапа сообщений для всех Telegram-страниц */
export type TelegramPageMessages = Record<string, PageMessage>;
