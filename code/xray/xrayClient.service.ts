import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { VpnAccountsDao } from 'code/database/dao';
import { XrayHelperService } from './xrayHelper.service';
import { XrayConfig } from './types';

@Injectable()
export class XrayClientService implements OnModuleInit {
  private xrayPath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonService,
    private readonly vpnAccountsDao: VpnAccountsDao,
    private readonly xrayHelperService: XrayHelperService,
  ) {}

  /**
   * Инициализация модуля:
   * - Загружает переменные окружения.
   * - Подставляет ключи (privateKey, shortIds) в конфиг.
   * - Загружает VPN-аккаунты из базы данных.
   */
  async onModuleInit() {
    const pathConfig = this.configService.get<string>('XRAY_CONFIG_PATH');

    if (pathConfig) {
      this.xrayPath = pathConfig;
    }

    await this.loadVpnAccountsFromDb();
  }

  /**
   * Добавляет в конфигурационный файл Xray новых клиентов
   * @param userIDs - список VPN-аккаунтов (uuid пользователей)
   * @returns true, если добавлены новые клиенты; false — если нет
   */
  async addVpnAccounts(userIDs: string[]): Promise<boolean> {
    const flow = this.configService.get<string>('XRAY_FLOW');

    if (!flow) {
      throw new Error('Не был получен flow для Xray');
    }

    try {
      const config = await this.xrayHelperService.readFile<XrayConfig>(
        this.xrayPath,
        { asJson: true },
      );
      const clients = config.inbounds[0]?.settings?.clients ?? [];
      const newClients = userIDs
        .filter((userId) => {
          const exists = clients.some((client) => client.id == userId);
          if (exists) {
            this.logger.warn(`Клиент ${userId} уже существует`, this);
            return false;
          }
          return true;
        })
        .map((userId) => ({
          id: userId,
          email: userId,
          flow,
        }));

      if (newClients.length == 0) {
        this.logger.log(`Ни одного нового клиента не добавлено`, this);
        return false;
      }

      clients.push(...newClients);
      config.inbounds[0].settings.clients = clients;
      this.xrayHelperService.writeFile(this.xrayPath, config);

      return this.xrayHelperService.restartXray();
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
  async removeClient(userId: string): Promise<boolean> {
    try {
      const config = await this.xrayHelperService.readFile<XrayConfig>(
        this.xrayPath,
        {
          asJson: true,
        },
      );
      const clients = config.inbounds[0].settings.clients || [];
      const filtered = clients.filter((c) => c.id != userId);

      if (filtered.length == clients.length) {
        this.logger.warn(`Клиент ${userId} не найден`, this);
        return false;
      }

      config.inbounds[0].settings.clients = filtered;
      this.xrayHelperService.writeFile(this.xrayPath, config);

      return this.xrayHelperService.restartXray();
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Неизвестная ошибка';

      this.logger.error(`Ошибка при удалении клиента: ${errMsg}`, this);
      return false;
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
        const vpnAccountsFiltered = vpnAccounts.map(({ userId }) => userId);

        await this.addVpnAccounts(vpnAccountsFiltered);
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
   * Формирует VLESS-ссылку для подключения к Xray серверу.
   * Использует данные из текущей конфигурации Xray и переменные окружения.
   * Делегирует генерацию xrayHelperService.
   *
   * @param userId - UUID пользователя, который будет использовать VPN
   * @returns Сформированная строка VLESS-ссылки
   */
  async generateVlessLink(userId: string): Promise<string> {
    return await this.xrayHelperService.generateVlessLink(userId);
  }
}
