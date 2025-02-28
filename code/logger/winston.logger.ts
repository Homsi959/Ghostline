import { LoggerModuleOptions, WinstonModule } from 'nest-winston';
import { createLogger, transports, format } from 'winston';

const winstonLogger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      const stack = new Error().stack;
      const methodName = stack?.split('\n')[2]?.trim();
      return `${timestamp} [${level}] ${methodName}: ${message}`;
    }),
  ),
  transports: [
    new transports.File({
      filename: 'logs/app.log',
    }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

export const winstonConfig: LoggerModuleOptions = {
  logger: winstonLogger,
};
