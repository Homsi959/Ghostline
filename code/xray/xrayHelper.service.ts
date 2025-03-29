import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { readFileSync, writeFileSync } from 'fs';
import { XrayConfig } from './types';
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
   * Возвращает конфиг Xray
   * @param {xrayPath} - Путь
   * @return {XrayConfig} - возвращает конфиг
   */
  readFile(xrayPath: string): XrayConfig {
    return JSON.parse(readFileSync(xrayPath, 'utf-8')) as XrayConfig;
  }

  /**
   * Перезаписывает конфиг Xray
   * @param {config} - js объект на запись
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  writeFile(xrayPath: string, config: XrayConfig) {
    writeFileSync(xrayPath, JSON.stringify(config, null, 2));
  }
}
