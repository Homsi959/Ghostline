import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { SubscriptionPlan, SubscriptionStatus } from './entity.enum';

/**
 * Сущность подписки.
 */
@Entity({ name: 'subscriptions' })
export class SubscriptionEntity {
  /**
   * Уникальный идентификатор подписки (автоинкремент).
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Пользователь, к которому относится подписка.
   * При удалении пользователя подписка удаляется (CASCADE).
   */
  @ManyToOne(() => UserEntity, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  /**
   * План подписки (например, trial, 1_month, 6_months).
   */
  @Column({ length: 50 })
  plan: SubscriptionPlan;

  /**
   * Дата начала подписки.
   */
  @Column({ type: 'timestamp', name: 'start_date', nullable: true })
  startDate: Date;

  /**
   * Дата окончания подписки.
   */
  @Column({ type: 'timestamp', name: 'end_date', nullable: true })
  endDate: Date;

  /**
   * Статус подписки (active, expired, canceled).
   */
  @Column({ type: 'varchar', length: 20 })
  status: SubscriptionStatus;

  /**
   * Дата создания подписки.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
