import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import {
  ConnectionInfo,
  ConnectionLogs,
  LimitedConnection,
  XrayConfig,
} from './types';
import { XrayHelperService } from './xrayHelper.service';
import { VpnAccountsDao } from 'code/database/dao';
import { VpnAccessDecision } from 'code/telegram/services/types';
import { XrayClientService } from './xrayClient.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class XrayMonitoringService implements OnModuleInit {
  public xrayConfig: XrayConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonService,
    private readonly xrayHelperService: XrayHelperService,
    private readonly vpnAccountsDao: VpnAccountsDao,
    private readonly xrayClientService: XrayClientService,
  ) {}

  async onModuleInit() {
    await this.processCheckConnectionLimits();
  }

  /**
   * Проверяет текущие подключения пользователей и сравнивает их с лимитами устройств.
   * На основе этого принимает решение — заблокировать или разблокировать клиентов.
   *
   * Шаги:
   * 1. Читает access.log с путём из XRAY_LOGS_PATH.
   * 2. Получает список VPN-аккаунтов из БД.
   * 3. Сопоставляет IP-адреса из логов с UUID и лимитами.
   * 4. Вычисляет, какие UUID нужно заблокировать или разблокировать.
   * 5. Выполняет блокировку/разблокировку соответствующих клиентов.
   */
  @Cron('*/5 * * * *')
  async processCheckConnectionLimits() {
    this.logger.log(
      `Началась проверка на количество подключенных устройств`,
      this,
    );

    const logsPath = this.configService.get<string>('XRAY_LOGS_PATH');
    const vpnAccounts = await this.vpnAccountsDao.getAllVpnAccounts();

    if (!logsPath || !vpnAccounts) return;

    const logsText = await this.xrayHelperService.readFile<string>(logsPath, {
      encoding: 'utf8',
    });
    const logsConnections = this.parseLogs(logsText);
    const limitedConnections = logsConnections.map(
      ({ userId, connections }) => {
        const account = vpnAccounts.find((acc) => acc.userId === userId);

        if (!account) {
          this.logger.error(
            `Лимит пользователя ${userId} на подключения устройств в БД не найден`,
            this,
          );
          throw new Error(
            `Лимит пользователя ${userId} на подключения устройств в БД не найден`,
          );
        }

        return {
          userId,
          IPs: connections.map(({ ip }) => ip),
          limit: account.devicesLimit,
          isBlocked: account.isBlocked,
        };
      },
    );
    const vpnAccessDecision =
      this.handleOverLimitConnections(limitedConnections);

    // Блокируем клиентов
    for (const userId of vpnAccessDecision.toBan) {
      this.logger.warn(
        `Превышен лимит подключений. Блокировка: ${userId}`,
        this,
      );
      await this.xrayClientService.removeClient(userId);
    }

    // Разблокируем клиентов
    for (const userId of vpnAccessDecision.toUnban) {
      this.logger.log(
        `Подключения в пределах нормы. Разблокировка: ${userId}`,
        this,
      );
      await this.xrayClientService.addVpnAccounts([userId]);
    }

    this.logger.log(
      `Закончена проверка на количество подключенных устройств`,
      this,
    );
  }

  /**
   * Распарсит сухие логи в объект
   *
   * @param logText - логи
   * @returns - готовый объект логов
   */
  private parseLogs(logText: string): ConnectionLogs {
    const lines = logText.trim().split('\n');
    const logMap = new Map<string, ConnectionInfo[]>();
    const result: ConnectionLogs = [];

    for (const line of lines) {
      const regex =
        /^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})(?:\.\d+)? from ([\d.]+):(\d+) accepted (tcp|udp):([\d.]+:\d+) \[([^\]]+)\] email: (.+)$/;
      const match = line.match(regex);

      if (!match) continue;

      const [, dateConnection, ip, port, protocol, appointment, inbound, uuid] =
        match;
      const connection: ConnectionInfo = {
        ip,
        port,
        inbound,
        appointment: `${protocol}:${appointment}`,
        dateConnection,
      };

      if (!logMap.has(uuid)) {
        logMap.set(uuid, []);
      }

      logMap.get(uuid)?.push(connection);
    }

    for (const [uuid, connections] of logMap.entries()) {
      result.push({ userId: uuid, connections });
    }

    return result;
  }

  /**
   * Определяет, каких клиентов следует заблокировать или разблокировать
   * на основе лимита устройств и текущих подключений из логов Xray.
   *
   * @param connections - массив клиентов с их IP-адресами и лимитами
   * @returns Объект с массивами userId для блокировки и разблокировки
   */
  private handleOverLimitConnections(
    connections: LimitedConnection[],
  ): VpnAccessDecision {
    const vpnAccessDecision: VpnAccessDecision = {
      toBan: [],
      toUnban: [],
    };

    for (const { isBlocked, userId, limit, IPs } of connections) {
      const overLimit = IPs.length > limit;

      // Если клиент уже заблокирован, но теперь в пределах лимита — разблокируем
      if (isBlocked && !overLimit) {
        vpnAccessDecision.toUnban.push(userId);
      }

      // Если клиент не заблокирован, но превысил лимит — блокируем
      if (!isBlocked && overLimit) {
        vpnAccessDecision.toBan.push(userId);
      }
    }

    return vpnAccessDecision;
  }
}
