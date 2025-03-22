import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinstonService } from 'code/logger/winston.service';
import { TelegramProfileEntity } from '../entities';
import { InsertTelegramProfileData, TelegramProfileDto } from './types';

/**
 * Репозиторий профилей Telegram.
 */
@Injectable()
export class TelegramProfilesRepository {
  /**
   * @param telegramRepository - репозиторий TelegramProfileEntity.
   * @param logger - сервис логирования.
   */
  constructor(
    @InjectRepository(TelegramProfileEntity)
    private readonly telegramRepository: Repository<TelegramProfileEntity>,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Создает профиль Telegram, используя QueryBuilder для возврата актуальных данных.
   * @param profileData - данные профиля для вставки.
   * @returns сохранённую сущность TelegramProfileEntity с заполненными значениями, установленными базой данных.
   */
  async createTelegramProfile(
    profileData: InsertTelegramProfileData,
  ): Promise<TelegramProfileEntity> {
    const insertResult = await this.telegramRepository
      .createQueryBuilder()
      .insert()
      .into(TelegramProfileEntity)
      .values({
        ...profileData,
        userId: { id: profileData.userId },
      })
      .returning('*')
      .execute();

    const savedProfile = insertResult.generatedMaps[0] as TelegramProfileEntity;

    this.logger.log(`Создан профиль с ID: ${savedProfile.telegramId}`, this);

    return savedProfile;
  }

  /**
   * Ищет профиль по telegramId.
   * @param telegramId - идентификатор Telegram.
   * @returns найденный профиль или undefined.
   */
  async getTelegramProfileById(
    telegramId: number,
  ): Promise<TelegramProfileDto | null> {
    const profileWithUserEntity = await this.telegramRepository
      .createQueryBuilder('profile')
      .leftJoin('profile.userId', 'user')
      .select([
        'profile.id',
        'profile.telegramId',
        'profile.isBot',
        'profile.languageCode',
        'profile.createdAt',
        'user.id',
      ])
      .where('profile.telegramId = :telegramId', { telegramId })
      .getOne();

    if (profileWithUserEntity) {
      this.logger.log(`Найден профиль с ID: ${telegramId}`, this);
      const profileWithoutUserEntity = {
        ...profileWithUserEntity,
        userId: profileWithUserEntity?.userId.id,
      };
      return profileWithoutUserEntity;
    } else {
      this.logger.warn(`Не найден профиль с ID: ${telegramId}`, this);
      return null;
    }
  }
}
