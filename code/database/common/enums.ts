/**
 * Статусы оплаты.
 * Используются для отслеживания состояния платежа.
 */
export enum PaymentStatus {
  /** Счёт создан, ожидается оплата */
  PENDING = 'pending',

  /** Оплата прошла успешно */
  PAID = 'paid',

  /** Попытка оплаты завершилась ошибкой */
  FAILED = 'failed',

  /** Срок действия счёта истёк */
  EXPIRED = 'expired',

  /** Платёж был отменён вручную или клиентом */
  CANCELED = 'canceled',

  /** Средства возвращены клиенту */
  REFUNDED = 'refunded',
}

/**
 * Методы оплаты, поддерживаемые сервисом.
 * Используются для указания способа, через который была совершена оплата.
 */
export enum PaymentMethod {
  /** Оплата через Robokassa */
  ROBOKASSA = 'robokassa',

  /** Оплата в криптовалюте */
  CRYPTO = 'crypto',

  /** Telegram Stars */
  TG_STARS = 'tg_stars',

  /** Ручная оплата (например, админом) */
  MANUAL = 'manual',
}

/**
 * Типы подписок.
 */
export enum SubscriptionPlan {
  TRIAL = 'trial',
  ONE_MONTH = '1_month',
  SIX_MONTHS = '6_months',
}

/**
 * Платные типы подписок (без триала).
 */
export enum PaidSubscriptionPlan {
  ONE_MONTH = SubscriptionPlan.ONE_MONTH,
  SIX_MONTHS = SubscriptionPlan.SIX_MONTHS,
}

/**
 * Статусы подписок.
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
}
