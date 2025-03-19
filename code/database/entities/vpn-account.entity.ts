import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * Сущность VPN-аккаунта.
 */
@Entity({ name: 'vpn_accounts' })
export class VpnAccountEntity {
  /**
   * Уникальный идентификатор VPN-аккаунта (автоинкремент).
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Пользователь, которому принадлежит VPN-аккаунт.
   * При удалении пользователя аккаунт удаляется (CASCADE).
   */
  @ManyToOne(() => UserEntity, (user) => user.vpnAccounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  userId: UserEntity['id'];

  /**
   * Уникальный UUID соединения.
   */
  @Column({ length: 36, unique: true, name: 'uuid_connection' })
  uuidConnection: string;

  /**
   * Адрес VPN-сервера.
   */
  @Column({ length: 100 })
  server: string;

  /**
   * Порт для подключения к VPN.
   */
  @Column()
  port: number;

  /**
   * Публичный ключ для установления соединения.
   */
  @Column({ length: 100, name: 'public_key' })
  publicKey: string;

  /**
   * SNI (Server Name Indication) для TLS-маскировки.
   */
  @Column({ length: 100 })
  sni: string;

  /**
   * Дата создания VPN-аккаунта.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
