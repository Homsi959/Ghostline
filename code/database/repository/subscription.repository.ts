import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { SubscriptionEntity } from '../entities';
import { SubscriptionData, UserSubscription } from './types';
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
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
  ) {}

  async findActiveSubscriptionById(
    userId: string,
  ): Promise<UserSubscription | null> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: {
          userId: { id: userId }, // 👈 передаём объект
          status: SubscriptionStatus.ACTIVE,
        },
      });

      if (subscription) {
        this.logger.log(`Найдена активная подписка пользователя ID: ${userId}`);
        return {
          ...subscription,
          userId: subscription.userId.id,
        } as UserSubscription;
      } else {
        return null;
      }
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
  async createSubscription({
    userId,
    plan,
    startDate,
    endDate,
  }: SubscriptionData): Promise<SubscriptionEntity | null> {
    try {
      const subscription = this.subscriptionRepository.create({
        userId: { id: userId },
        plan,
        startDate,
        endDate,
      });

      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      this.logger.error(`Ошибка при создании подписки: ${error.message}`, this);
      return null;
    }
  }
}
