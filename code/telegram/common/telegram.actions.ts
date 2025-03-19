/**
 * Названия событий
 */
export const ACTIONS_KEYS = {
  ACTIVATE_TRIAL: 'activateTrial', // Активировать на 7 дней
  BUY_FOR_1_MONTH: 'buyFor1Month', // Купить на 1 месяц
  BUY_FOR_6_MONTHS: 'buyFor6Months', // Купить на 6 месяцев
  GO_BACK: 'goBack', // Назад
} as const;

// Группировка экшенов по категориям
export const PURCHASE_ACTIONS = [
  ACTIONS_KEYS.ACTIVATE_TRIAL,
  ACTIONS_KEYS.BUY_FOR_1_MONTH,
  ACTIONS_KEYS.BUY_FOR_6_MONTHS,
];
