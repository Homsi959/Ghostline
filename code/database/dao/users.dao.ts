import { Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { v4 } from 'uuid';

/**
 * Репозиторий пользователей.
 */
@Injectable()
export class UsersDao {
  /**
   * @param userRepository - репозиторий UserEntity.
   * @param logger - сервис логирования.
   */
  constructor(private readonly logger: WinstonService) {}

  /**
   * Создает нового пользователя.
   * @returns сохранённую сущность пользователя.
   */
  async createUser(): Promise<any> {
    const values = { id: v4() };

    try {
      this.logger.log(`Cоздан пользователь с ID: ${values.id}`, this);
    } catch (error: any) {
      throw new Error(`Не удалось создать пользователя`, error);
    }
  }
}
