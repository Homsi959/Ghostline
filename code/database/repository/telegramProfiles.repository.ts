import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { Pool } from 'pg';
import { TUser } from './repository.types';

@Injectable()
export class TelegramProfilesRepository {
  /**
   * @param db - Пул подключений к базе данных.
   * @param logger - Сервис логирования.
   */
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Pool,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Создание Telegram профиля в базе данных.
   *
   * @param user - Пользователь Telegram.
   * @returns {boolean} - Успешность создания пользователя.
   */
  public async createTelegramProfile(user: TUser): Promise<boolean> {
    const query = {
      name: 'create-telegram_profile',
      text: `
        INSERT INTO telegram_profiles (
            user_id, 
            telegram_id, 
            is_bot, 
            first_name, 
            last_name, 
            username, 
            language_code, 
            is_premium, 
            added_to_attachment_menu
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      values: [
        user.user_id,
        user.id,
        user.is_bot,
        user.first_name,
        user.last_name,
        user.username,
        user.language_code,
        user.is_premium,
        user.added_to_attachment_menu,
      ],
    };

    try {
      await this.db.query(query);

      this.logger.log(
        `[TelegramRepository.createTelegramProfile] - Создан новый Telegram профиль с ID: ${user.id}. Для пользователя с ID: ${user.user_id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `[TelegramRepository.createTelegramProfile] - Ошибка при создании Telegram профиля: ${error.message}`,
        error,
      );
      throw new Error('Ошибка при создании пользователя');
    }
  }

  public async getUserByTelegramId(telegramId: number) {}

  /**
   * Находит пользователя в telegram_profiles
   *
   * @param telegramID - Telegram идентификатор
   * @returns - id telegram профиля, либо undefined, если не найден
   */
  public async getTelegramProfileById(
    telegramID: number,
  ): Promise<number | undefined> {
    const query = {
      name: 'find-telegram_profile',
      text: `SELECT telegram_id 
            FROM telegram_profiles
            WHERE telegram_id = $1`,
      values: [telegramID],
    };

    try {
      const result = await this.db.query(query);
      const foundTelegramID = result.rows[0].telegram_id as number;

      if (foundTelegramID) {
        this.logger.log(
          `[TelegramRepository.getUserById] - Найден профиль Telegram: ${foundTelegramID}`,
        );

        return foundTelegramID;
      } else {
        return undefined;
      }
    } catch (error) {
      this.logger.error(
        `[TelegramRepository.getUserById] - Ошибка при поиске профиля: ${error.message}`,
        error,
      );
      throw new Error(`Ошибка при поиске профиля Telegram`);
    }
  }
}
