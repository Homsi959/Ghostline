import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, transports, format, Logger } from 'winston';
import { TMetaDataLogs } from './winston.types';
import { ConfigService } from '@nestjs/config';
import { LOG_LEVEL_KEY } from 'code/common/constants';

@Injectable()
export class WinstonService implements LoggerService {
  private readonly logger: Logger;

  constructor(private readonly config: ConfigService) {
    this.logger = createLogger({
      level: this.config.get(LOG_LEVEL_KEY),
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

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(message, trace && trace);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
