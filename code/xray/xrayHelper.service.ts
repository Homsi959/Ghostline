import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { readFile, writeFile } from 'fs/promises';
import { ReadFileOptions, XrayConfig } from './types';
import { execSync } from 'child_process';
import { SshService } from 'code/ssh/ssh.service';
import { DEVELOPMENT_LOCAL } from 'code/common/constants';

@Injectable()
export class XrayHelperService {
  constructor(
    private readonly logger: WinstonService,
    private readonly configService: ConfigService,
    private readonly sshService: SshService,
  ) {}

  /**
   * Перезапускает Xray
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  async restartXray(): Promise<boolean> {
    const xrayConfigPath = this.configService.get<string>('XRAY_CONFIG_PATH');
    const isDevLocal = this.configService.get('NODE_ENV') === DEVELOPMENT_LOCAL;

    if (!xrayConfigPath) {
      throw new Error('XRAY_CONFIG_PATH не задан');
    }

    try {
      if (isDevLocal) {
        await this.sshService.runCommand('sudo systemctl restart xray');
      } else {
        execSync('sudo systemctl restart xray');
      }

      this.logger.log(
        `Xray на контуре ${isDevLocal ? 'DEV' : 'PROD'} перезапущен`,
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
    const xrayPath = this.configService.get<string>('XRAY_CONFIG_PATH');
    if (!xrayPath) {
      throw new Error('Не найден путь к конфиг файлу Xray в env');
    }

    const config = await this.readFile<XrayConfig>(xrayPath, {
      asJson: true,
    });
    const { inbounds } = config;
    const inbound = inbounds[0];
    const protocol = inbound.protocol;
    const security = inbound.streamSettings.security;
    const shortId = inbound.streamSettings.realitySettings.shortIds[0];
    const sni = inbound.streamSettings.realitySettings.serverNames[0];

    const isDevLocal =
      this.configService.get<string>('NODE_ENV') == DEVELOPMENT_LOCAL;
    const flow = this.configService.get<string>('XRAY_FLOW');
    const pbk = this.configService.get<string>('XRAY_PUBLIC_KEY');
    const host = this.configService.get<string>(
      isDevLocal ? 'VPS_DEV_HOST' : 'XRAY_LISTEN_IP',
    );
    const tag = this.configService.get<string>('XRAY_LINK_TAG');

    if (!flow || !pbk || !host || !tag) {
      this.logger.error(
        'Не удалось сформировать ссылку — отсутствуют необходимые параметры',
        this,
      );
      throw new Error('Недостаточно данных для генерации ссылки');
    }

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
    const configPath = this.configService.get<string>('XRAY_CONFIG_PATH');
    const isDevLocal =
      this.configService.get<string>('NODE_ENV') == DEVELOPMENT_LOCAL;
    let content;

    if (isDevLocal) {
      content = await this.sshService.runCommand(`cat ${configPath}`);
    } else {
      content = await readFile(filePath, encoding ? { encoding } : undefined);
    }

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
   * Записывает конфиг Xray локально или на удалённый сервер через SSH
   * @param xrayPath - путь к локальному файлу
   * @param config - JS-объект конфигурации Xray
   */
  async writeFile(xrayPath: string, config: XrayConfig): Promise<void> {
    const isDevLocal =
      this.configService.get<string>('NODE_ENV') === DEVELOPMENT_LOCAL;

    const configPath = this.configService.get<string>('XRAY_CONFIG_PATH');

    if (!configPath) {
      throw new Error('XRAY_CONFIG_PATH не задан');
    }

    const configContent = JSON.stringify(config, null, 2);

    try {
      if (isDevLocal) {
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
