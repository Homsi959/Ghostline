import { SubscriptionPlan } from 'code/database/entities/entity.enum';

export interface ActivateSubscribing {
  userId: string;
  plan: SubscriptionPlan;
}
