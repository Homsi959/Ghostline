import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinstonService } from 'code/logger/winston.service';
import { TelegramProfileEntity } from '../entities';
import { InsertTelegramProfileData } from './types';

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
      .values(profileData)
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
  ): Promise<TelegramProfileEntity | undefined> {
    const profile = await this.telegramRepository.findOne({
      where: { telegramId },
    });

    if (profile) {
      this.logger.log(`Найден профиль с ID: ${telegramId}`, this);
    }

    return profile || undefined;
  }
}
