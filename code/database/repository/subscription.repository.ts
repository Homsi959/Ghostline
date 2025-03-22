import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { SubscriptionData, UserSubscription } from './types';
import { SubscriptionStatus } from '../common/enum';

/**
 * Репозиторий подписок.
 */
@Injectable()
export class SubscriptionRepository {
  /**
   * @param logger - сервис логирования.
   */
  constructor(private readonly logger: WinstonService) {}

  async findActiveSubscriptionById(userId: string): Promise<any> {
    try {
    } catch (error: any) {
      this.logger.error(`Не удалось создать пользователя`, this, error);
      return null;
    }
  }

  /**
   * Создаёт подписку в базе данных.
   * @param data - Данные подписки.
   * @returns Созданная подписка либо null.
   */
  async createSubscription(): Promise<any> {}
}
