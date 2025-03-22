import { Inject, Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { DATABASE_TOKEN } from 'code/common/constants';
import { SavedTelegramProfile } from '../common/types';

/**
 * DAO профилей Telegram.
 */
@Injectable()
export class TelegramProfilesDao {
  /**
   * @param logger - сервис логирования.
   * @param db - соеденение с БД.
   */
  constructor(
    private readonly logger: WinstonService,
    @Inject(DATABASE_TOKEN) private readonly db: Pool,
  ) {}

  /**
   * Создает профиль Telegram и возвращает telegram_id при успешной вставке.
   * @param profileData - данные профиля для вставки.
   * @returns telegram_id, если вставка прошла успешно, иначе null.
   */
  async saveTelegramProfile({
    isBot,
    telegramId,
    languageCode,
    userId,
  }: SavedTelegramProfile): Promise<number | null> {
    const query = {
      name: 'save-telegram_profile',
      text: `
      INSERT INTO telegram_profiles (
        user_id,
        telegram_id,
        is_bot,
        language_code
      )
      VALUES ($1, $2, $3, $4)
      RETURNING telegram_id
    `,
      values: [userId, telegramId, isBot, languageCode],
    };

    try {
      const result = await this.db.query<{ telegram_id: number }>(query);
      const insertedId = result.rows[0]?.telegram_id ?? null;

      this.logger.log(
        `[saveTelegramProfile] Профиль Telegram создан (telegram_id=${insertedId})`,
      );

      return insertedId;
    } catch (error: any) {
      this.logger.error(
        `[saveTelegramProfile] Ошибка при создании профиля: ${error.message}`,
        error,
      );
      return null;
    }
  }

  /**
   * Ищет профиль по telegramId.
   * @param telegramId - идентификатор Telegram.
   * @returns найденный профиль или undefined.
   */
  async getTelegramProfileById(telegramId: number): Promise<any> {}
}
