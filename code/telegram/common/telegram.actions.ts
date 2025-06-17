import { SubscriptionPlan } from 'code/database/common/enums';

/**
 * Экшены, связанные с оформлением подписки
 */
export const PURCHASE_ACTIONS_KEYS = {
  BUY_FOR_1_DAY: 'buyFor1Day', // Купить на 1 день
  BUY_FOR_1_MONTH: 'buyFor1Month', // Купить на 1 месяц
  BUY_FOR_6_MONTHS: 'buyFor6Months', // Купить на 6 месяцев
} as const;

/**
 * Общий словарь всех экшенов
 */
export const ACTIONS_KEYS = {
  GO_BACK: 'goBack', // Назад
  ACTIVATE_TRIAL: 'activateTrial', // Активировать на 7 дней
  CHECK_PAYMENT: 'checkPayment', // Проверить оплатил ли клиент чек
  ...PURCHASE_ACTIONS_KEYS,
} as const;

/**
 * Ключи событий, которые соответствуют действиям по покупке подписки.
 *
 * Используется для маппинга экшенов Telegram-кнопок к типам подписки (SubscriptionPlan).
 * Только эти ключи допустимы в объекте ACTIONS_TO_SUBSCRIPTION.
 */
type PurchaseActionKey =
  | typeof ACTIONS_KEYS.BUY_FOR_1_DAY
  | typeof ACTIONS_KEYS.BUY_FOR_1_MONTH
  | typeof ACTIONS_KEYS.BUY_FOR_6_MONTHS;

/**
 * Маппинг экшенов на соответствующие тарифные планы
 */
export const ACTIONS_TO_SUBSCRIPTION: Record<
  PurchaseActionKey,
  SubscriptionPlan
> = {
  [ACTIONS_KEYS.BUY_FOR_1_DAY]: SubscriptionPlan.ONE_DAY,
  [ACTIONS_KEYS.BUY_FOR_1_MONTH]: SubscriptionPlan.ONE_MONTH,
  [ACTIONS_KEYS.BUY_FOR_6_MONTHS]: SubscriptionPlan.SIX_MONTHS,
};

/**
 * Все экшены, связанные с покупкой подписки
 */
export const PURCHASE_ACTIONS = Object.values(PURCHASE_ACTIONS_KEYS);
