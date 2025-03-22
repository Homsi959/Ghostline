import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { SubscriptionPlan } from 'code/database/common/enum';
import { SubscriptionRepository } from 'code/database/repository/subscription.repository';
import { ActivateSubscription } from './types';
import { TelegramProfilesRepository } from 'code/database/repository/telegramProfiles.repository';

@Injectable()
export class TelegramSubscribingService {
  constructor(
    private readonly logger: WinstonService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly telegramProfilesRepository: TelegramProfilesRepository,
  ) {}

  async processPurchase({ telegramId, plan }: ActivateSubscription) {
    const telegramProfile =
      await this.telegramProfilesRepository.getTelegramProfileById(telegramId);

    if (!telegramProfile) {
      this.logger.error(`Не найден Telegram-профиль с ID: ${telegramId}`);
      return;
    }

    const userId = telegramProfile.userId;
    const userSubscription =
      await this.subscriptionRepository.findActiveSubscriptionById(userId);

    if (userSubscription) {
      this.logger.log(
        `Пользователь ${userId} уже имеет активную подписку: ${userSubscription.plan}`,
      );
      // TODO: предложить вывести существующий ключ
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);

    switch (plan) {
      case SubscriptionPlan.TRIAL:
        endDate.setDate(startDate.getDate() + 7);
        break;
      case SubscriptionPlan.ONE_MONTH:
        endDate.setUTCMonth(startDate.getUTCMonth() + 1);
        break;
      case SubscriptionPlan.SIX_MONTHS:
        endDate.setUTCMonth(startDate.getUTCMonth() + 6);
        break;
      default:
        this.logger.error(`Неизвестный тип подписки: ${String(plan)}`);
        return;
    }
  }
}
