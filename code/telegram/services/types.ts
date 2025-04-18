import { SubscriptionPlan } from 'code/database/common/enums';
import { Context } from '../common/telegram.types';

export interface ActivatedSubscription {
  telegramId: number;
  plan: SubscriptionPlan;
}

export interface VpnAccessDecision {
  toBan: string[];
  toUnban: string[];
}

export interface CreateActiveVpnAccess {
  userId: string;
  plan: SubscriptionPlan;
  context: Context;
}
