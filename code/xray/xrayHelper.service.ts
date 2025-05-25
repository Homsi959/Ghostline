import { Inject, Injectable } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { readFile, writeFile } from 'fs/promises';
import { ReadFileOptions, XrayConfig } from './types';
import { execSync } from 'child_process';
import { SshService } from 'code/ssh/ssh.service';
import {
  CONFIG_PROVIDER_TOKEN,
  DEVELOPMENT,
  DEVELOPMENT_LOCAL,
} from 'code/common/constants';
import { AppConfig } from 'code/config/types';

@Injectable()
export class XrayHelperService {
  private isDev: boolean;

  constructor(
    private readonly logger: WinstonService,
    @Inject(CONFIG_PROVIDER_TOKEN)
    private readonly config: AppConfig,
    private readonly sshService: SshService,
  ) {
    const devVars = [DEVELOPMENT, DEVELOPMENT_LOCAL];

    this.isDev = devVars.includes(config.nodeEnv);
  }

  /**
   * Перезапускает Xray
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  async restartXray(): Promise<boolean> {
    const isDev = this.isDev;
    const restartXrayCommand = 'docker restart ghostline_xray';

    try {
      if (this.config.nodeEnv === DEVELOPMENT_LOCAL) {
        await this.sshService.runCommand(restartXrayCommand);
      } else {
        execSync(restartXrayCommand);
      }

      this.logger.log(
        `Xray на контуре ${isDev ? 'DEV' : 'PROD'} перезапущен`,
        this,
      );
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Не удалось перезапустить Xray: ${message}`, this);
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
  async generateVlessLink(userId: string): Promise<string> {
    const xrayPath = this.config.xray.configPath;
    const config = await this.readFile<XrayConfig>(xrayPath, {
      asJson: true,
    });
    const { inbounds } = config;
    const inbound = inbounds[0];
    const protocol = inbound.protocol;
    const security = inbound.streamSettings.security;
    const shortId = inbound.streamSettings.realitySettings.shortIds[0];
    const sni = inbound.streamSettings.realitySettings.serverNames[0];

    const flow = this.config.xray.flow;
    const pbk = this.config.xray.publicKey;
    const host = this.isDev
      ? this.config.vpsDev.host
      : this.config.xray.listenAddress;
    const tag = this.config.xray.linkTag;

    const query = [
      `security=${security}`,
      `flow=${flow}`,
      `pbk=${pbk}`,
      `sid=${shortId}`,
      `sni=${sni}`,
      'method=none',
      'encryption=none',
      'type=tcp',
    ].join('&');

    const vlessLink = `${protocol}://${userId}@${host}:443?${query}#${encodeURIComponent(tag)}`;

    this.logger.log(`Создана VLESS ссылка: ${vlessLink}`, this);
    return vlessLink;
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
    let content;

    if (this.config.nodeEnv === DEVELOPMENT_LOCAL) {
      content = await this.sshService.runCommand(`cat ${filePath}`);
    } else {
      content = await readFile(filePath, encoding ? { encoding } : undefined);
    }

    if (asJson) {
      const jsonString =
        typeof content === 'string'
          ? content
          : (content.toString('utf-8') as string);

      try {
        return JSON.parse(jsonString) as T;
      } catch (error) {
        throw new Error(`Ошибка парсинга JSON из файла ${filePath}: ${error}`);
      }
    }

    return content as T;
  }

  /**
   * Записывает конфиг Xray локально или на удалённый сервер через SSH
   * @param xrayPath - путь к локальному файлу
   * @param config - JS-объект конфигурации Xray
   */
  async writeFile(xrayPath: string, config: XrayConfig): Promise<void> {
    const configPath = this.config.xray.configPath;
    const configContent = JSON.stringify(config, null, 2);

    try {
      if (this.config.nodeEnv === DEVELOPMENT_LOCAL) {
        // Экранируем JSON, чтобы безопасно передать через SSH
        const encoded = Buffer.from(configContent).toString('base64');
        const command = `echo "${encoded}" | base64 -d | sudo tee ${configPath} > /dev/null`;

        await this.sshService.runCommand(command);
        this.logger.log(
          `Файл Xray записан по SSH на путь: ${configPath}`,
          this,
        );
      } else {
        await writeFile(xrayPath, configContent);
        this.logger.log(
          `Файл Xray успешно записан локально: ${xrayPath}`,
          this,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Ошибка при записи Xray-файла: ${message}`, this);
      throw err;
    }
  }
}
