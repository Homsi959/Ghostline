import { SubscriptionPlan } from 'code/database/common/enum';

export interface ActivateSubscription {
  telegramId: number;
  plan: SubscriptionPlan;
}
