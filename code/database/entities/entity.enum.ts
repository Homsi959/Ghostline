/**
 * Статусы платежей.
 */
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
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
 * Статусы подписок.
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
}
