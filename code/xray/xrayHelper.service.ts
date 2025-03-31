import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { writeFile, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { ReadFileOptions, XrayConfig } from './types';
import { execSync, spawn } from 'child_process';

@Injectable()
export class XrayHelperService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Перезапускает Xray
   * @return {boolean} - перезапуск прошел удачно или нет
   */
  restartXray(): boolean {
    const rawPath = this.configService.get<string>('XRAY_CONFIG_PATH');

    if (!rawPath) {
      throw new Error('XRAY_CONFIG_PATH не задан');
    }

    const configPath = path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(process.cwd(), rawPath);

    try {
      try {
        execSync('pkill xray');
        this.logger.log('Предыдущий процесс Xray завершен', this);
      } catch {
        this.logger.warn(
          'Процесс Xray не был запущен ранее или уже завершен',
          this,
        );
      }

      // Запускаем Xray в фоне
      const child = spawn('xray', ['run', '-c', configPath], {
        detached: true,
        stdio: 'ignore',
      });

      child.unref();

      // (опционально) сохраняем PID для управления в будущем
      const pidPath = path.resolve(__dirname, '../../../xray.pid');
      if (child.pid) writeFileSync(pidPath, child.pid.toString());

      this.logger.log(`Xray перезапущен. PID: ${child.pid}`, this);
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка запуска Xray';
      this.logger.error(`Не удалось запустить Xray: ${message}`, this);
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
      `sni=${sni}`,
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
