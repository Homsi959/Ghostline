import { SubscriptionPlan } from 'code/database/common/enums';

/**
 * Экшены, связанные с оформлением подписки
 */
export const PURCHASE_ACTIONS_KEYS = {
  ACTIVATE_TRIAL: 'activateTrial', // Активировать на 7 дней
  BUY_FOR_1_MONTH: 'buyFor1Month', // Купить на 1 месяц
  BUY_FOR_6_MONTHS: 'buyFor6Months', // Купить на 6 месяцев
} as const;

/**
 * Общий словарь всех экшенов
 */
export const ACTIONS_KEYS = {
  GO_BACK: 'goBack', // Назад
  HOW_TO_CONNECT: 'howToConnect', // Как подключить VPN
  ...PURCHASE_ACTIONS_KEYS,
} as const;

type PurchaseActionKey =
  | typeof ACTIONS_KEYS.ACTIVATE_TRIAL
  | typeof ACTIONS_KEYS.BUY_FOR_1_MONTH
  | typeof ACTIONS_KEYS.BUY_FOR_6_MONTHS;

/**
 * Маппинг экшенов на соответствующие тарифные планы
 */
export const ACTIONS_TO_SUBSCRIPTION: Record<
  PurchaseActionKey,
  SubscriptionPlan
> = {
  [ACTIONS_KEYS.ACTIVATE_TRIAL]: SubscriptionPlan.TRIAL,
  [ACTIONS_KEYS.BUY_FOR_1_MONTH]: SubscriptionPlan.ONE_MONTH,
  [ACTIONS_KEYS.BUY_FOR_6_MONTHS]: SubscriptionPlan.SIX_MONTHS,
};

/**
 * Все экшены, связанные с покупкой подписки
 */
export const PURCHASE_ACTIONS = Object.values(PURCHASE_ACTIONS_KEYS);
