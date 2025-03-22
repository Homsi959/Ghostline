import { SubscriptionPlan, SubscriptionStatus } from './enums';

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
 * Созданый телеграм профиль
 */
export interface SavedTelegramProfile {
  telegramId: number;
  isBot: boolean;
  languageCode: string;
  userId: string;
}
