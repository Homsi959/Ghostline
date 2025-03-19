import {
  IsBoolean,
  IsInt,
  IsString,
  IsDefined,
  MaxLength,
  IsOptional,
  validate,
} from 'class-validator';
import { plainToClass, Type } from 'class-transformer';
import { User } from 'telegraf/types';
import { LoggerService } from '@nestjs/common';

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
   * Код языка пользователя.
   */
  @IsOptional()
  @IsString({ message: 'languageCode должен быть строкой' })
  @MaxLength(10, { message: 'languageCode не должен превышать 10 символов' })
  public readonly languageCode?: string;
}

/**
 * Валидирует и трансформирует данные из Telegram в DTO.
 */
export async function toTelegramProfileDto(
  from: User,
  logger?: LoggerService,
): Promise<CreateTelegramProfileDto> {
  const dto = plainToClass(CreateTelegramProfileDto, {
    telegramId: from.id,
    isBot: from.is_bot,
    languageCode: from.language_code,
  });

  const errors = await validate(dto);
  if (errors.length > 0) {
    logger?.error(
      `[toTelegramProfileDto] - Ошибка валидации Telegram DTO`,
      JSON.stringify(errors),
    );
    throw new Error(`Ошибка валидации данных Telegram-пользователя`);
  }

  return dto;
}
