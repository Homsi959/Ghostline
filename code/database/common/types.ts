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
 * Базовая структура подписки из БД
 */
export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

/**
 * Только активная подписка
 */
export interface ActiveSubscription extends Subscription {
  status: SubscriptionStatus.ACTIVE;
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
  flow: string;
  devicesLimit: number;
  isBlocked: boolean;
}

export type CreateVpnAccount = Omit<VpnAccount, 'createdAt'>;

export type Transaction = {
  id: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: Date;
  userId: string;
  description: string;
  paidAt: Date | null;
};
