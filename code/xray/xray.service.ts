import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { readFileSync, writeFileSync } from 'fs';
import { XrayConfig } from './types';
import { execSync } from 'child_process';

@Injectable()
export class XrayService implements OnModuleInit {
  private configPath: string;
  private restartCmd: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Инициализация модуля:
   * - Загружает переменные среды для конфигурации Xray.
   * - Устанавливает путь до конфигурационного файла и команду рестарта.
   * - Подставляет ключи (privateKey, shortIds) в конфиг, если они заданы.
   */
  onModuleInit() {
    const configPath = this.configService.get<string>('XRAY_CONFIG_PATH');
    const restartCmd = this.configService.get<string>('XRAY_RESTART_COMMAND');
    const privateKey = this.configService.get<string>('XRAY_PRIVATE_KEY');
    const shortId = this.configService.get<string>('XRAY_SHORT_ID');

    if (configPath) this.configPath = configPath;
    if (restartCmd) this.restartCmd = restartCmd;

    const config = this.readConfig();
    const inbound = config.inbounds?.[0];
    const streamSettings = inbound?.streamSettings;
    const realitySettings = streamSettings?.realitySettings;

    if (realitySettings && privateKey && shortId) {
      realitySettings.privateKey = privateKey;
      realitySettings.shortIds = [shortId];
      this.writeConfig(config);
    }
  }

  /**
   * Добавляет в конфгурационный файл Xray нового клиента
   * @param {userId} - uuid пользователя
   * @return {boolean} - добавление прошло удачно или нет
   */
  addClient(userId: string): boolean {
    try {
      const config = this.readConfig();
      const clients = config.inbounds[0]?.settings?.clients || [];

      if (clients.find((client) => client.id == userId)) {
        this.logger.warn(`Клиент ${userId} уже существует`, this);
        return false;
      }

      clients.push({ id: userId, flow: 'xtls-rprx-vision' });
      config.inbounds[0].settings.clients = clients;

      this.writeConfig(config);
      return this.restartXray();
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(`Ошибка при добавлении клиента: ${errMsg}`, this);
      return false;
    }
  }

  /**
   * Удаляет в конфгурационном файле Xray клиента
   * @param {userId} - uuid пользователя
   * @return {boolean} - удаление прошло удачно или нет
   */
  removeClient(userId: string): boolean {
    try {
      const config = this.readConfig();
      const clients = config.inbounds[0]?.settings?.clients || [];

      const filtered = clients.filter((c) => c.id != userId);
      if (filtered.length == clients.length) {
        this.logger.warn(`Клиент ${userId} не найден`, this);
        return false;
      }

      config.inbounds[0].settings.clients = filtered;
      this.writeConfig(config);
      return this.restartXray();
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(`Ошибка при удалении клиента: ${errMsg}`, this);
      return false;
    }
  }

  /**
   * Перезапускает Xray
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  restartXray(): boolean {
    try {
      execSync(this.restartCmd);
      this.logger.log(`Xray успешно перезапущен`, this);
      return true;
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(`Не удалось перезапустить Xray: ${errMsg}`);
      return false;
    }
  }

  /**
   * Возвращает конфиг Xray
   * @return {XrayConfig} - возвращает конфиг
   */
  private readConfig(): XrayConfig {
    return JSON.parse(readFileSync(this.configPath, 'utf-8')) as XrayConfig;
  }

  /**
   * Перезаписывает конфиг Xray
   * @param {config} - js объект на запись
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  private writeConfig(config: XrayConfig) {
    writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }
}
