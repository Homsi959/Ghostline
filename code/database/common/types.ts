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
  languageCode: string | undefined;
  userId: string;
}

/**
 * Сохраненный телеграм профиль
 */
export interface TelegramProfile {
  telegramId: number;
  isBot: boolean;
  languageCode: string | undefined;
  createdAt: Date;
  userId: string;
}

/**
 * VPN-аккаунт
 */
export interface VpnAccount {
  server: string;
  port: number;
  publicKey: string;
  sni: string;
  createdAt: Date;
  userId: string;
  flow: string | null;
}
