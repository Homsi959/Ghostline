import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { InsertTelegramProfileData } from './types';

/**
 * Репозиторий профилей Telegram.
 */
@Injectable()
export class TelegramProfilesDao {
  /**
   * @param telegramRepository - репозиторий TelegramProfileEntity.
   * @param logger - сервис логирования.
   */
  constructor(private readonly logger: WinstonService) {}

  /**
   * Создает профиль Telegram, используя QueryBuilder для возврата актуальных данных.
   * @param profileData - данные профиля для вставки.
   * @returns сохранённую сущность TelegramProfileEntity с заполненными значениями, установленными базой данных.
   */
  async createTelegramProfile(
    profileData: InsertTelegramProfileData,
  ): Promise<any> {}

  /**
   * Ищет профиль по telegramId.
   * @param telegramId - идентификатор Telegram.
   * @returns найденный профиль или undefined.
   */
  async getTelegramProfileById(telegramId: number): Promise<any> {}
}
