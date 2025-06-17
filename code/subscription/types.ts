import { SubscriptionPlan } from 'code/database/common/enums';

export type PaidPlanInfo = {
  description: string;
  amount: number;
};

export const PAID_PLANS: Record<
  Exclude<SubscriptionPlan, SubscriptionPlan.TRIAL>,
  PaidPlanInfo
> = {
  [SubscriptionPlan.ONE_MONTH]: {
    description: 'Подписка на 1 месяц',
    amount: 190,
  },
  [SubscriptionPlan.SIX_MONTHS]: {
    description: 'Подписка на 6 месяцев',
    amount: 990,
  },
};
