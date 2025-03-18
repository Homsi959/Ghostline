import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinstonService } from 'code/logger/winston.service';
import { UserEntity } from '../entities';

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
    const newUser = this.userRepository.create();
    const savedUser = await this.userRepository.save(newUser);
    this.logger.log(
      `[UsersRepository.createUser] - Создан новый пользователь c ID: ${savedUser.id}`,
    );
    return savedUser;
  }
}
