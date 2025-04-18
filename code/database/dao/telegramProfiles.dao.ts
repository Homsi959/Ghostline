import { Inject, Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { DATABASE_TOKEN } from 'code/common/constants';
import { SaveTelegramProfile, TelegramProfile } from '../common/types';
import { TelegramProfileEntity } from '../common/entities';

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
  }: SaveTelegramProfile): Promise<number | null> {
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
        `Профиль Telegram создан (telegram_id=${insertedId})`,
        this,
      );

      return insertedId;
    } catch (error: any) {
      this.logger.error(
        `Ошибка при создании профиля: ${error.message}`,
        this,
        error,
      );
      return null;
    }
  }

  /**
   * Ищет Telegram профиль по userId.
   * @param userId - идентификатор клиента.
   * @returns найденный профиль или null.
   */
  async findTelegramProfileByTelegramId(
    telegramId: number,
  ): Promise<TelegramProfile | null> {
    const query = {
      name: 'get-telegram_profile-by-telegram_id',
      text: `
      SELECT *
      FROM telegram_profiles
      WHERE telegram_id = $1
      LIMIT 1
    `,
      values: [telegramId],
    };

    try {
      const { rows } = await this.db.query<TelegramProfileEntity>(query);
      const row = rows[0];

      if (!row) return null;

      const mappedProfile: TelegramProfile = {
        telegramId: row.telegram_id,
        isBot: row.is_bot,
        languageCode: row.language_code,
        createdAt: row.created_at,
        userId: row.user_id,
      };

      return mappedProfile;
    } catch (error: any) {
      this.logger.error(
        `Ошибка при получении профиля: ${error.message}`,
        this,
        error,
      );
      return null;
    }
  }
}
