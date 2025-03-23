import { SubscriptionPlan, SubscriptionStatus } from './enums';

/**
 * Данные на создание подписки
 */
export interface ActivateSubscription {
  userId: string;
  plan: SubscriptionPlan;
  startDate: Date;
  endDate: Date;
}

/**
 * Активная подписка из БД
 */
export interface ActiveSubscription {
  status: SubscriptionStatus.ACTIVE;
  userId: string;
  plan: SubscriptionPlan;
  startDate;
  endDate: Date;
  createdAt: Date;
}

/**
 * Данные для добавления телеграм профиля
 */
export interface SaveTelegramProfile {
  telegramId: number;
  isBot: boolean;
  languageCode: string;
  userId: string;
}

/**
 * Сохраненный телеграм профиль
 */
export interface TelegramProfile {
  telegramId: number;
  isBot: boolean;
  languageCode: string;
  createdAt: Date;
  userId: string;
}
