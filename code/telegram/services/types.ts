import { SubscriptionPlan } from 'code/database/entities/entity.enum';

export interface ActivateSubscription {
  telegramId: number;
  plan: SubscriptionPlan;
}
