import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinstonService } from 'code/logger/winston.service';
import { UserEntity } from '../entities';
import { v4 } from 'uuid';

/**
 * Репозиторий пользователей.
 */
@Injectable()
export class UsersRepository {
  /**
   * @param userRepository - репозиторий UserEntity.
   * @param logger - сервис логирования.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Создает нового пользователя.
   * @returns сохранённую сущность пользователя.
   */
  async createUser(): Promise<UserEntity> {
    const values = { id: v4() };

    try {
      const insertResult = await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values(values)
        .returning('*')
        .execute();

      this.logger.log(
        `[UsersRepository.createUser] - Cоздан пользователь с ID: ${values.id}`,
      );

      return insertResult.generatedMaps[0] as UserEntity;
    } catch (error: any) {
      throw new Error(
        `[UsersRepository.createUser] - не удалось создать пользователя`,
        error,
      );
    }
  }
}
