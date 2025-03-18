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
   * Пользователь, к которому привязан профиль.
   * При удалении пользователя профиль удаляется (CASCADE).
   */
  @ManyToOne(() => UserEntity, (user) => user.telegramProfiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * Флаг, указывающий, является ли аккаунт ботом.
   */
  @Column({ type: 'boolean', nullable: true, name: 'is_bot' })
  isBot: boolean;

  /**
   * Первое имя пользователя.
   */
  @Column({ length: 100, nullable: true, name: 'first_name' })
  firstName: string;

  /**
   * Фамилия пользователя.
   */
  @Column({ length: 100, nullable: true, name: 'last_name' })
  lastName: string;

  /**
   * Имя пользователя в Telegram.
   */
  @Column({ length: 50, nullable: true })
  username: string;

  /**
   * Код языка пользователя.
   */
  @Column({ length: 10, nullable: true, name: 'language_code' })
  languageCode: string;

  /**
   * Флаг наличия подписки на премиум.
   */
  @Column({ type: 'boolean', nullable: true, name: 'is_premium' })
  isPremium: boolean;

  /**
   * Флаг, указывающий, добавлен ли профиль в меню вложений.
   */
  @Column({ type: 'boolean', nullable: true, name: 'added_to_attachment_menu' })
  addedToAttachmentMenu: boolean;

  /**
   * Дата создания профиля.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
