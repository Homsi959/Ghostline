import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { VpnAccountsDao } from 'code/database/dao';
import fs from 'fs';
import { XrayConfig } from './types';

@Injectable()
export class XrayMonitoringService implements OnModuleInit {
  public xrayConfig: XrayConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonService,
    private readonly vpnAccountsDao: VpnAccountsDao,
  ) {}

  async onModuleInit() {}

  // private checkConnectedDevices(): void {
  //   const logPath = './logs/access.log';
  //   const uuidLimit = 3;

  //   const log = fs.readFileSync(logPath, 'utf8');
  //   const lines = log.split('\n');

  //   const uuidMap = new Map<string, Set<string>>();

  //   for (const line of lines) {
  //     const match = line.match(/\[(.*?)\] (.*?)@/);
  //     if (!match) continue;

  //     const tag = match[1];
  //     const uuid = match[2];
  //     const ipMatch = line.match(/(\d+\.\d+\.\d+\.\d+):\d+/);
  //     if (!ipMatch) continue;

  //     const ip = ipMatch[1];

  //     if (!uuidMap.has(uuid)) uuidMap.set(uuid, new Set());
  //     uuidMap.get(uuid)?.add(ip);
  //   }

  //   for (const [uuid, ips] of uuidMap) {
  //     if (ips.size > uuidLimit) {
  //       console.warn(
  //         `⚠️ UUID ${uuid} подключился с ${ips.size} IP — превышен лимит`,
  //       );
  //       // Здесь можно отключить клиента или отправить alert
  //     }
  //   }
  // }

  // private parseLogs(): Promise<ConnectionLogs> {}
}
