import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PASSWORD_3X_UI, USER_3X_UI } from 'code/common/constants';
import { WinstonService } from 'code/logger/winston.service';
import { lastValueFrom } from 'rxjs';
import { LoginResponse } from './threeXUI.types';
import axios from 'axios';

@Injectable()
export class ThreeXUIService implements OnModuleInit {
  /**
   * @private
   * @property {string} cookie - Строка, представляющая cookie,
   * используемую для управления сессией или аутентификации.
   */
  private cookie: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: WinstonService,
  ) {}

  async onModuleInit() {
    const username = this.configService.get<string>(USER_3X_UI);
    const password = this.configService.get<string>(PASSWORD_3X_UI);

    if (username && password) {
      await this.login(username, password);
    }
  }

  /**
   * Выполняет авторизацию в панели 3x-ui с указанными учетными данными.
   *
   * @param username - Имя пользователя
   * @param password - Пароль пользователя
   * @returns Строка куки в формате "имя=значение" для последующих запросов
   * @throws {Error} При ошибке авторизации
   */
  async login(username: string, password: string): Promise<string> {
    const body = {
      username,
      password,
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    const request = this.httpService.post<LoginResponse>('/login', body, {
      timeout: 5000,
      headers,
      withCredentials: true,
    });

    try {
      const {
        data: { success },
        headers,
      } = await lastValueFrom(request);

      if (success) {
        this.logger.log(
          `[ThreeXUIService.login] - Авторизация в панели прошла успешно`,
        );
      } else {
        this.logger.warn(
          `[ThreeXUIService.login] - Неудачная попытка авторизации для пользователя ${username}`,
        );
      }

      const cookieArr: string[] = headers['set-cookie']![0].split(';');
      const cookieKeyValue = cookieArr[0];

      this.cookie = cookieKeyValue;

      return cookieKeyValue;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status: number | undefined = error.response?.status;
        const responseData: unknown = error.response?.data;

        this.logger.error(
          `[ThreeXUIService.login] - Ошибка HTTP ${status}: ${
            error.message
          }, данные: ${JSON.stringify(responseData)}`,
        );

        switch (status) {
          case 401:
            throw new Error('Неверные учетные данные для входа в панель');
          case 429:
            throw new Error('Слишком много попыток входа, попробуйте позже');
          default:
            break;
        }
      }

      this.logger.error(
        `[ThreeXUIService.login] - Неожиданная ошибка: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw new Error('Авторизация в панели неудачна');
    }
  }
}
