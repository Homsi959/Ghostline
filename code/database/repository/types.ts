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
