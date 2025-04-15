import { SubscriptionPlan, SubscriptionStatus } from './enums';

/**
 * Схема таблицы пользователя (таблица users)
 */
export interface UserEntity {
  id: string; // UUID
  created_at: Date;
}

/**
 * Схема таблицы подписок (таблица subscriptions)
 */
export interface SubscriptionEntity {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  start_date: Date;
  end_date: Date;
  created_at: Date;
}

/**
 * Схема таблицы Telegram-профиля (таблица telegram_profiles)
 */
export interface TelegramProfileEntity {
  id: number;
  telegram_id: number;
  is_bot: boolean;
  language_code: string | undefined;
  created_at: Date;
  user_id: string;
}

/**
 * Схема таблицы платежа (таблица payments)
 */
export interface PaymentEntity {
  id: number;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  created_at: Date;
  user_id: string;
  description: string;
  paid_at: Date | null;
}

/**
 * Схема таблицы VPN-аккаунта (таблица vpn_accounts)
 */
export interface VpnAccountEntity {
  id: number;
  server: string;
  port: number;
  public_key: string;
  sni: string;
  created_at: Date;
  user_id: string;
  flow: string;
  devices_limit: number;
  is_blocked: boolean;
}
