import { SubscriptionPlan } from 'code/database/entities/entity.enum';

/**
 * Названия событий
 */
export const ACTIONS_KEYS = {
  ACTIVATE_TRIAL: 'activateTrial', // Активировать на 7 дней
  BUY_FOR_1_MONTH: 'buyFor1Month', // Купить на 1 месяц
  BUY_FOR_6_MONTHS: 'buyFor6Months', // Купить на 6 месяцев
  GO_BACK: 'goBack', // Назад
} as const;

// Маппинг экшенов Telegram в планы подписки
export const ACTIONS_TO_SUBSCRIPTION: Record<string, SubscriptionPlan> = {
  [ACTIONS_KEYS.ACTIVATE_TRIAL]: SubscriptionPlan.TRIAL,
  [ACTIONS_KEYS.BUY_FOR_1_MONTH]: SubscriptionPlan.ONE_MONTH,
  [ACTIONS_KEYS.BUY_FOR_6_MONTHS]: SubscriptionPlan.SIX_MONTHS,
};

export const PURCHASE_ACTIONS = Object.values(ACTIONS_KEYS);
