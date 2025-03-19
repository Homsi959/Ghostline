import {
  IsBoolean,
  IsInt,
  IsString,
  IsDefined,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для создания Telegram-профиля.
 */
export class CreateTelegramProfileDto {
  /**
   * Идентификатор Telegram.
   */
  @IsDefined({ message: 'Telegram ID обязателен' })
  @Type(() => Number)
  @IsInt({ message: 'Telegram ID должен быть целым числом' })
  public readonly telegramId: number;

  /**
   * Флаг, указывающий, является ли аккаунт ботом.
   */
  @IsDefined({ message: 'Флаг isBot обязателен' })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isBot должен быть булевым значением' })
  public readonly isBot: boolean;

  /**
   * Первое имя пользователя.
   */
  @IsOptional()
  @IsString({ message: 'firstName должен быть строкой' })
  @MaxLength(100, { message: 'firstName не должен превышать 100 символов' })
  public readonly firstName?: string;

  /**
   * Фамилия пользователя.
   */
  @IsOptional()
  @IsString({ message: 'lastName должен быть строкой' })
  @MaxLength(100, { message: 'lastName не должен превышать 100 символов' })
  public readonly lastName?: string;

  /**
   * Код языка пользователя.
   */
  @IsOptional()
  @IsString({ message: 'languageCode должен быть строкой' })
  @MaxLength(10, { message: 'languageCode не должен превышать 10 символов' })
  public readonly languageCode?: string;

  /**
   * Флаг наличия подписки на премиум.
   */
  @IsDefined({ message: 'Флаг isPremium обязателен' })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isPremium должен быть булевым значением' })
  public readonly isPremium: boolean;

  /**
   * Флаг, указывающий, добавлен ли профиль в меню вложений.
   */
  @IsDefined({ message: 'Флаг addedToAttachmentMenu обязателен' })
  @Type(() => Boolean)
  @IsBoolean({ message: 'addedToAttachmentMenu должен быть булевым значением' })
  public readonly addedToAttachmentMenu: boolean;
}
