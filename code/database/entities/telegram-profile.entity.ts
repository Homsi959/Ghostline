import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * Сущность профиля Telegram.
 */
@Entity({ name: 'telegram_profiles' })
export class TelegramProfileEntity {
  /**
   * Пользователь, к которому привязан профиль.
   * При удалении пользователя профиль удаляется (CASCADE).
   */
  @ManyToOne(() => UserEntity, (user) => user.telegramProfiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  userId: UserEntity;

  /**
   * Уникальный идентификатор профиля (автоинкремент).
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Идентификатор Telegram.
   */
  @Column({ type: 'bigint', unique: true, name: 'telegram_id' })
  telegramId: number;

  /**
   * Флаг, указывающий, является ли аккаунт ботом.
   */
  @Column({ type: 'boolean', nullable: true, name: 'is_bot' })
  isBot: boolean;

  /**
   * Код языка пользователя.
   */
  @Column({ length: 10, nullable: true, name: 'language_code' })
  languageCode: string;

  /**
   * Дата создания профиля.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
