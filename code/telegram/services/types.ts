import { SubscriptionPlan } from 'code/database/entities/entity.enum';

export interface ActivateSubscription {
  userId: string;
  plan: SubscriptionPlan;
}
