import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { SubscriptionPlan } from 'code/database/entities/entity.enum';
import { SubscriptionRepository } from 'code/database/repository/subscription.repository';
import { ActivateSubscription } from './types';

@Injectable()
export class TelegramSubscribingService {
  constructor(
    private readonly logger: WinstonService,
    private readonly subscribingRepo: SubscriptionRepository,
  ) {}

  async processPurchase({ userId, plan }: ActivateSubscription) {
    const userSubscription =
      await this.subscribingRepo.findAcitveSubscriptionById(userId);

    if (userSubscription) {
      // подписка существует
      // предложить вывести существующий ключ
      return;
    }

    switch (plan) {
      case SubscriptionPlan.TRIAL:
        break;

      case SubscriptionPlan.ONE_MONTH:
        break;

      case SubscriptionPlan.SIX_MONTHS:
        break;

      default:
        this.logger.error(`Неизвестный план подписки: ${String(plan)}`, this);
        return;
    }
  }
}
