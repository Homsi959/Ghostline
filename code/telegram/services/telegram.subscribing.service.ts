import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { ActivateSubscription } from './types';
import { SubscriptionDao, TelegramProfilesDao } from 'code/database/dao';
import { SubscriptionPlan } from 'code/database/common/enums';

@Injectable()
export class TelegramSubscribingService {
  constructor(
    private readonly logger: WinstonService,
    private readonly SubscriptionDao: SubscriptionDao,
    private readonly TelegramProfilesDao: TelegramProfilesDao,
  ) {}

  async processPurchase({ telegramId, plan }: ActivateSubscription) {
    const telegramProfile =
      await this.TelegramProfilesDao.getTelegramProfileByTelegramId(telegramId);

    if (!telegramProfile) {
      this.logger.error(`Не найден Telegram-профиль с ID: ${telegramId}`);
      return;
    }

    const userId = telegramProfile.userId;
    const userSubscription =
      await this.SubscriptionDao.findActiveSubscriptionById(userId);

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
