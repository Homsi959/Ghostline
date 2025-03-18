import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinstonService } from 'code/logger/winston.service';
import { TelegramProfileEntity } from '../entities';

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
    profileData: Partial<TelegramProfileEntity>,
  ): Promise<TelegramProfileEntity> {
    const insertResult = await this.telegramRepository
      .createQueryBuilder()
      .insert()
      .into(TelegramProfileEntity)
      .values(profileData)
      .returning('*')
      .execute();

    const savedProfile = insertResult.generatedMaps[0] as TelegramProfileEntity;

    this.logger.log(
      `[TelegramProfilesRepository.createTelegramProfile] - Создан профиль с ID: ${savedProfile.telegramId}`,
    );

    return savedProfile;
  }

  /**
   * Ищет профиль по telegramId.
   * @param telegramID - идентификатор Telegram.
   * @returns найденный профиль или undefined.
   */
  async getTelegramProfileById(
    telegramID: number,
  ): Promise<TelegramProfileEntity | undefined> {
    const profile = await this.telegramRepository.findOne({
      where: { telegramId: telegramID },
    });
    if (profile) {
      this.logger.log(
        `[TelegramProfilesRepository.getTelegramProfileById] - Найден профиль с ID: ${telegramID}`,
      );
    }
    return profile || undefined;
  }
}
