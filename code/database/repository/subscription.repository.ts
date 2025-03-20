import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { SubscriptionEntity } from '../entities';
import { UserSubscription } from './types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionStatus } from '../entities/entity.enum';

/**
 * Репозиторий подписок.
 */
@Injectable()
export class SubscriptionRepository {
  /**
   * @param logger - сервис логирования.
   */
  constructor(
    private readonly logger: WinstonService,
    @InjectRepository(SubscriptionEntity)
    private readonly SubscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async findAcitveSubscriptionById(
    userId: string,
  ): Promise<UserSubscription | null> {
    try {
      const Subscription = await this.SubscriptionRepo.findOne({
        where: { userId, status: SubscriptionStatus.ACTIVE },
      });

      if (Subscription) {
        this.logger.log(`Найдена активная подписка пользователя ID: ${userId}`);
        return Subscription;
      } else {
        return null;
      }
    } catch (error: any) {
      throw new Error(`Не удалось создать пользователя`, error);
    }
  }

  async addSubscription() {}
}
