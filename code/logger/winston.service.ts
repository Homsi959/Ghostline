import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { createLogger, transports, format, Logger } from 'winston';
import { TMetaDataLogs } from './winston.types';
import { buildContext, levelFormatted } from 'code/common/utils';
import { AppConfig } from 'code/config/types';
import { CONFIG_PROVIDER_TOKEN } from 'code/common/constants';

/**
 * Сервис для работы с логированием с использованием библиотеки winston.
 * Обрабатывает различные уровни логирования и выводит сообщения в консоль.
 */
@Injectable()
export class WinstonService implements LoggerService {
  private readonly logger: Logger;

  constructor(
    @Inject(CONFIG_PROVIDER_TOKEN)
    readonly config: AppConfig,
  ) {
    this.logger = createLogger({
      level: config.logLevel,
      format: format.combine(
        format((info) => {
          if (info.level == 'info') info.level = 'log';
          return info;
        })(),
        format.colorize({ all: true }),
        format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        format.printf(
          ({ timestamp, level, message, context }: TMetaDataLogs) => {
            return `${timestamp} ${levelFormatted(level)}${context ? ` [${context}]` : ''}: ${message}`;
          },
        ),
      ),
      transports: [new transports.Console()],
    });
  }

  log(message: string, classInstance?: object) {
    const context = buildContext(classInstance);
    this.logger.info(message, { context });
  }

  error(message: string, classInstance?: object, trace?: string) {
    const context = buildContext(classInstance);
    this.logger.error(message + (trace ? ` | ${trace}` : ''), { context });
  }

  warn(message: string, classInstance?: object) {
    const context = buildContext(classInstance);
    this.logger.warn(message, { context });
  }

  debug(message: string, classInstance?: object) {
    const context = buildContext(classInstance);
    this.logger.debug(message, { context });
  }

  verbose(message: string, classInstance?: object) {
    const context = buildContext(classInstance);
    this.logger.verbose(message, { context });
  }
}
