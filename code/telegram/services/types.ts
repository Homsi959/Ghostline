import { SubscriptionPlan } from 'code/database/dao/enums';

export interface ActivateSubscription {
  telegramId: number;
  plan: SubscriptionPlan;
}
