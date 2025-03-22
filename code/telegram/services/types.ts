import { SubscriptionPlan } from 'code/database/common/enums';

export interface ActivateSubscription {
  telegramId: number;
  plan: SubscriptionPlan;
}
