import { SubscriptionPlan } from '../entities/entity.enum';

/**
 * Интерфейс для данных, используемых при вставке профиля Telegram в базу данных.
 */
export interface InsertTelegramProfileData {
  /**
   * Уникальный идентификатор пользователя в системе.
   */
  userId: string;

  /**
   * Уникальный идентификатор Telegram пользователя.
   */
  telegramId: number;

  /**
   * Флаг, указывающий, является ли пользователь ботом (необязательное поле).
   */
  isBot?: boolean;

  /**
   * Код языка пользователя в Telegram (необязательное поле).
   */
  languageCode?: string;
}

/**
 * Существующая пользователься подписка
 */
export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlan;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

/**
 * Интерфейс данных для создания подписки.
 */
export interface SubscriptionData {
  userId: string; // ID пользователя
  plan: SubscriptionPlan; // Тип подписки
  startDate: Date; // Начало подписки
  endDate: Date; // Окончание подписки
}

export interface TelegramProfileDto {
  id: number;
  telegramId: number;
  isBot: boolean;
  languageCode: string;
  createdAt: Date;
  userId: string;
}
