/**
 * Тип для описания кнопок Telegram.
 */
export type TTelegramButton = {
  text: string; // Текст на кнопке
  action: string; // Действие, которое будет выполнено при нажатии на кнопку
};

/**
 * Тип для конфигурации кнопок на странице Telegram.
 */
type TTelegramButtonConfig = {
  buttons: TTelegramButton[]; // Массив кнопок
  columns?: number; // Количество колонок на клавиатуре
};

/**
 * Тип для описания страницы Telegram.
 */
type TTelegramPage = {
  message: string; // Сообщение, которое будет отображено на странице
  keyboardConfig?: TTelegramButtonConfig; // Конфигурация клавиатуры с кнопками
  goBackButton?: boolean; // Опциональная кнопка "Назад"
};

/**
 * Тип для всех страниц Telegram.
 */
export type TTelegramPages = {
  [key: string]: TTelegramPage; // Ключ — это уникальное название страницы, значение — описание страницы
};
