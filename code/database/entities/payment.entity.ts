import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PaymentStatus } from './entity.enum';
import { UserEntity } from './user.entity';

/**
 * Сущность платежа.
 */
@Entity({ name: 'payments' })
export class PaymentEntity {
  /**
   * Уникальный идентификатор платежа (автоинкремент).
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Пользователь, которому принадлежит платеж.
   * При удалении пользователя платеж удаляется (CASCADE).
   */
  @ManyToOne(() => UserEntity, (user) => user.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  /**
   * Сумма платежа.
   */
  @Column('numeric', { precision: 10, scale: 2 })
  amount: number;

  /**
   * Валюта платежа (например, USD, EUR).
   */
  @Column({ length: 10 })
  currency: string;

  /**
   * Метод платежа (например, credit card, PayPal).
   */
  @Column({ length: 50, name: 'payment_method' })
  paymentMethod: string;

  /**
   * Идентификатор транзакции.
   */
  @Column({ length: 100, name: 'transaction_id' })
  transactionId: string;

  /**
   * Статус платежа.
   */
  @Column({ type: 'varchar', length: 20 })
  status: PaymentStatus;

  /**
   * Дата создания платежа.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
