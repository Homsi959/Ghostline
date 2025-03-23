import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { ActivatedSubscription } from './types';
import { SubscriptionDao, TelegramProfilesDao } from 'code/database/dao';
import { SubscriptionPlan } from 'code/database/common/enums';

@Injectable()
export class TelegramSubscribingService {
  constructor(
    private readonly logger: WinstonService,
    private readonly subscriptionDao: SubscriptionDao,
    private readonly telegramProfilesDao: TelegramProfilesDao,
  ) {}

  async processPurchase({ telegramId, plan }: any): Promise<any> {
    const telegramProfile =
      await this.telegramProfilesDao.getTelegramProfileByTelegramId(telegramId);

    if (telegramProfile) {
      this.logger.log(`Найден профиль Telegram для c ID=${telegramId}`, this);
    } else {
      this.logger.error(`Не найден Telegram-профиль с ID: ${telegramId}`, this);
      return;
    }

    const userId = telegramProfile.userId;
    const userSubscription =
      await this.subscriptionDao.findActiveSubscriptionById(userId);

    if (userSubscription) {
      this.logger.log(
        `Пользователь ${userId} уже имеет активную подписку: ${userSubscription.plan}`,
        this,
      );

      return;
    } else if (!userSubscription) {
      this.logger.warn(`Нет активных подписок у пользователя: ${userId}`, this);

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

    const activatedSubscription = await this.subscriptionDao.createSubscription(
      {
        userId,
        plan,
        startDate,
        endDate,
      },
    );

    if (activatedSubscription) {
      this.logger.log(
        `Подписка активирована для пользователя ${userId} c Telegram профилем: ${telegramId} на план ${plan}`,
        this,
      );

      return activatedSubscription;
    } else if (!activatedSubscription) {
      this.logger.warn(
        `Не удалось создать подписку: план ${plan}, пользователь ${userId}`,
        this,
      );

      return;
    }
  }
}
