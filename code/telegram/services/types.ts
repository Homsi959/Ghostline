import { SubscriptionPlan } from 'code/database/common/enums';

export interface ActivatedSubscription {
  telegramId: number;
  plan: SubscriptionPlan;
}

export interface VpnAccessDecision {
  toBan: string[];
  toUnban: string[];
}
