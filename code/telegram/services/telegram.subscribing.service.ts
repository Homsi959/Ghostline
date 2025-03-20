import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { ActivateSubscribing } from './types';
import { SubscriptionPlan } from 'code/database/entities/entity.enum';

@Injectable()
export class TelegramSubscribingService {
  constructor(private readonly logger: WinstonService) {}

  async processPurchase({ userId, plan }: ActivateSubscribing) {
    switch (plan) {
      case SubscriptionPlan.TRIAL:
        // Логика для пробной подписки
        break;

      case SubscriptionPlan.ONE_MONTH:
        // Логика для подписки на 1 месяц
        break;

      case SubscriptionPlan.SIX_MONTHS:
        // Логика для подписки на 6 месяцев
        break;

      default:
        this.logger.error(`Неизвестный план подписки: ${String(plan)}`, this);
        return;
    }

    // Общая логика после определения плана
  }
}
