import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { writeFile } from 'fs';
import { readFile } from 'fs/promises';
import { ReadFileOptions, XrayConfig } from './types';
import { execSync } from 'child_process';

@Injectable()
export class XrayHelperService implements OnModuleInit {
  public xrayConfig: XrayConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Инициализация модуля:
   * Загрузка конфига в переменную xrayConfig
   */
  onModuleInit() {
    // const xrayConfigPath = this.configService.get<string>('XRAY_CONFIG_PATH');
    // if (xrayConfigPath) {
    //   this.xrayConfig = this.readConfig(xrayConfigPath);
    // }
  }

  /**
   * Перезапускает Xray
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  restartXray(): boolean {
    const restartCmd = this.configService.get<string>('XRAY_RESTART_COMMAND');

    if (!restartCmd) return false;

    try {
      execSync(restartCmd);
      this.logger.log(`Xray успешно перезапущен`, this);
      return true;
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(
        `Не удалось перезапустить Xray: ${errMsg}`,
        this,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  /**
   * Формирует VLESS-ссылку для подключения к Xray серверу.
   * Использует данные из текущей конфигурации Xray и переменные окружения.
   *
   * @param userId - UUID пользователя, который будет использовать VPN
   * @returns Сформированная строка VLESS-ссылки
   */
  generateVlessLink(userId: string): string {
    const { inbounds } = this.xrayConfig;

    const inbound = inbounds[0];
    const protocol = inbound.protocol;
    const security = inbound.streamSettings.security;
    const shortId = inbound.streamSettings.realitySettings.shortIds[0];

    const flow = this.configService.get<string>('XRAY_FLOW');
    const pbk = this.configService.get<string>('XRAY_PUBLIC_KEY');
    const host = this.configService.get<string>('XRAY_LISTEN_IP');
    const tag = this.configService.get<string>('XRAY_LINK_TAG');

    if (!flow || !pbk || !host || !tag) {
      this.logger.error(
        'Не удалось сформировать ссылку — отсутствуют необходимые параметры',
        this,
      );
      throw new Error('Недостаточно данных для генерации ссылки');
    }

    const query = [
      'encryption=none',
      `security=${security}`,
      `flow=${flow}`,
      `pbk=${pbk}`,
      `sid=${shortId}`,
      'sni=www.microsoft.com',
      'method=none',
    ].join('&');

    const link = `${protocol}://${userId}@${host}:443?${query}#${encodeURIComponent(tag)}`;

    this.logger.log(`Создана VLESS ссылка: ${link}`, this);
    return link;
  }

  /**
   * Универсальное чтение файла: текст, JSON или бинарный
   * @param filePath Путь до файла
   * @param options Опции чтения: парсинг JSON и/или указание кодировки
   * @returns Содержимое файла в нужном формате
   */
  async readFile<T = any>(
    filePath: string,
    options: ReadFileOptions = {},
  ): Promise<T> {
    const { asJson = false, encoding } = options;

    const content = await readFile(
      filePath,
      encoding ? { encoding } : undefined,
    );

    if (asJson) {
      const jsonString =
        typeof content === 'string' ? content : content.toString('utf-8');

      try {
        return JSON.parse(jsonString) as T;
      } catch (error) {
        throw new Error(`Ошибка парсинга JSON из файла ${filePath}: ${error}`);
      }
    }

    return content as T;
  }

  /**
   * Перезаписывает конфиг Xray
   * @param {config} - js объект на запись
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  writeFile(xrayPath: string, config: XrayConfig) {
    writeFile(xrayPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        this.logger.error(`Ошибка записи файла: ${err.message}`, this);
        throw err;
      }
      this.logger.log(`Файл успешно записан: ${xrayPath}`, this);
    });
  }
}
