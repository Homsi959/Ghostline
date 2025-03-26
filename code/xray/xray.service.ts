import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { readFileSync, writeFileSync } from 'fs';
import { Client, XrayConfig } from './types';
import { execSync } from 'child_process';
import { VpnAccountsDao } from 'code/database/dao';

@Injectable()
export class XrayService implements OnModuleInit {
  private xrayConfigPath: string;
  public xrayConfig: XrayConfig;

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
    const xrayConfigPath = this.configService.get<string>('XRAY_CONFIG_PATH');

    if (xrayConfigPath) this.xrayConfigPath = xrayConfigPath;

    this.xrayConfig = this.readConfig();
    await this.loadVpnAccountsFromDb();
  }

  /**
   * Добавляет в конфигурационный файл Xray новых клиентов
   * @param {vpnAccounts} - список VPN-аккаунтов (uuid пользователей)
   * @return {boolean} - добавление прошло успешно или нет
   */
  addVpnAccounts(vpnAccounts: Client[]): boolean {
    try {
      const config = this.readConfig();
      const clients = config.inbounds[0]?.settings?.clients || [];
      let updated = false;

      for (const { id, flow } of vpnAccounts) {
        const exists = clients.some((client) => client.id == id);

        if (exists) {
          this.logger.warn(`Клиент ${id} уже существует`, this);
          continue;
        }

        clients.push({ id, flow });
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

        this.addVpnAccounts(vpnAccountsFiltered);
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
    return JSON.parse(readFileSync(this.xrayConfigPath, 'utf-8')) as XrayConfig;
  }

  /**
   * Перезаписывает конфиг Xray
   * @param {config} - js объект на запись
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  private writeConfig(config: XrayConfig) {
    writeFileSync(this.xrayConfigPath, JSON.stringify(config, null, 2));
  }
}
