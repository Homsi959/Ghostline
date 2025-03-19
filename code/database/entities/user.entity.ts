import { Entity, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { SubscriptionEntity } from './subscription.entity';
import { TelegramProfileEntity } from './telegram-profile.entity';
import { VpnAccountEntity } from './vpn-account.entity';

/**
 * Сущность пользователя.
 */
@Entity({ name: 'users' })
export class UserEntity {
  /**
   * UUID пользователя.
   */
  @PrimaryColumn('uuid')
  id: string;

  /**
   * Дата создания пользователя.
   */
  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  /**
   * Платежи пользователя.
   */
  @OneToMany(() => PaymentEntity, (payment) => payment.userId)
  payments: PaymentEntity[];

  /**
   * Подписки пользователя.
   */
  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.userId)
  subscriptions: SubscriptionEntity[];

  /**
   * Профили Telegram, связанные с пользователем.
   */
  @OneToMany(() => TelegramProfileEntity, (profile) => profile.userId)
  telegramProfiles: TelegramProfileEntity[];

  /**
   * VPN-аккаунты пользователя.
   */
  @OneToMany(() => VpnAccountEntity, (account) => account.userId)
  vpnAccounts: VpnAccountEntity[];
}
