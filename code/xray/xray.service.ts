import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { readFileSync, writeFileSync } from 'fs';
import { Client, XrayConfig } from './types';
import { execSync } from 'child_process';
import { VpnAccountsDao } from 'code/database/dao';

@Injectable()
export class XrayService implements OnModuleInit {
  private configPath: string;
  private restartCmd: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonService,
    private readonly vpnAccountsDao: VpnAccountsDao,
  ) {}

  /**
   * Инициализация модуля:
   * - Загружает переменные окружения.
   * - Подставляет ключи (privateKey, shortIds) в конфиг.
   * - Загружает VPN-аккаунты из базы данных.
   */
  async onModuleInit() {
    this.loadEnvironmentConfig();
    this.injectKeysIntoConfig();
    await this.loadVpnAccountsFromDb();
  }

  /**
   * Добавляет в конфигурационный файл Xray новых клиентов
   * @param {vpnAccounts} - список VPN-аккаунтов (uuid пользователей)
   * @return {boolean} - добавление прошло успешно или нет
   */
  addClients(vpnAccounts: Client[]): boolean {
    try {
      const config = this.readConfig();
      const clients = config.inbounds[0]?.settings?.clients || [];
      let updated = false;

      for (const account of vpnAccounts) {
        const exists = clients.some((client) => client.id == account.id);

        if (exists) {
          this.logger.warn(`Клиент ${account.id} уже существует`, this);
          continue;
        }

        clients.push({ id: account.id, flow: 'xtls-rprx-vision' });
        updated = true;
      }

      if (!updated) {
        this.logger.log(`Ни одного нового клиента не добавлено`, this);
        return false;
      }

      config.inbounds[0].settings.clients = clients;
      this.writeConfig(config);

      return this.restartXray();
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(`Ошибка при добавлении клиентов: ${errMsg}`, this);
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
   * Загружает переменные окружения:
   * - XRAY_CONFIG_PATH: путь до конфигурационного файла.
   * - XRAY_RESTART_COMMAND: команда перезапуска Xray.
   */
  private loadEnvironmentConfig() {
    const configPath = this.configService.get<string>('XRAY_CONFIG_PATH');
    const restartCmd = this.configService.get<string>('XRAY_RESTART_COMMAND');

    if (configPath) this.configPath = configPath;
    if (restartCmd) this.restartCmd = restartCmd;
  }

  /**
   * Подставляет в конфигурационный файл Xray ключи из переменных окружения:
   * - XRAY_PRIVATE_KEY
   * - XRAY_SHORT_ID
   * Если поля присутствуют, перезаписывает конфигурационный файл.
   */
  private injectKeysIntoConfig() {
    const privateKey = this.configService.get<string>('XRAY_PRIVATE_KEY');
    const shortId = this.configService.get<string>('XRAY_SHORT_ID');

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
   * Загружает VPN-аккаунты из базы данных и выводит их в лог.
   * Позже здесь можно будет синхронизировать их с конфигурацией Xray.
   */
  private async loadVpnAccountsFromDb() {
    try {
      const vpnAccounts = await this.vpnAccountsDao.getAllVpnAccounts();

      if (!vpnAccounts || vpnAccounts.length == 0) {
        this.logger.warn(`VPN-аккаунты не найдены в базе данных.`, this);
        return;
      } else {
        const vpnAccountsFiltered = vpnAccounts
          .filter(({ flow }) => !!flow)
          .map(({ userId, flow }) => ({
            id: userId,
            flow,
          })) as Client[];

        this.addClients(vpnAccountsFiltered);
        this.logger.log(
          `Загружено VPN-аккаунтов из БД в конфиг Xray: ${vpnAccounts.length}`,
          this,
        );
      }
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : 'Неизвестная ошибка при загрузке VPN-аккаунтов из БД';

      this.logger.error(errMsg, this);
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
