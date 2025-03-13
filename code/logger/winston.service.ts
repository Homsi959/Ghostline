import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, transports, format, Logger } from 'winston';
import { TMetaDataLogs } from './winston.types';
import { ConfigService } from '@nestjs/config';
import { LOG_LEVEL_KEY } from 'code/common/constants';

/**
 * Сервис для работы с логированием с использованием библиотеки winston.
 * Обрабатывает различные уровни логирования и выводит сообщения в консоль.
 */
@Injectable()
export class WinstonService implements LoggerService {
  private readonly logger: Logger;

  constructor(private readonly config: ConfigService) {
    this.logger = createLogger({
      level: this.config.get<string>(LOG_LEVEL_KEY),
      format: format.combine(
        format.colorize({
          all: true,
        }),
        format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        format.printf(({ timestamp, level, message }: TMetaDataLogs) => {
          return `${timestamp} [${level}]: ${message}`;
        }),
      ),
      transports: [new transports.Console()],
    });
  }

  /**
   * Логирует сообщение уровня "info".
   * @param message - Сообщение для логирования.
   */
  log(message: string) {
    this.logger.info(message);
  }

  /**
   * Логирует сообщение уровня "error".
   * @param message - Сообщение для логирования.
   * @param trace - Стек вызовов для ошибки.
   */
  error(message: string, trace?: string) {
    this.logger.error(message, trace && trace);
  }

  /**
   * Логирует сообщение уровня "warn".
   * @param message - Сообщение для логирования.
   */
  warn(message: string) {
    this.logger.warn(message);
  }

  /**
   * Логирует сообщение уровня "debug".
   * @param message - Сообщение для логирования.
   */
  debug(message: string) {
    this.logger.debug(message);
  }

  /**
   * Логирует сообщение уровня "verbose".
   * @param message - Сообщение для логирования.
   */
  verbose(message: string) {
    this.logger.verbose(message);
  }
}
