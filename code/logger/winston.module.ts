import { Global, Module } from '@nestjs/common';
import { WinstonService } from './winston.service';

/**
 * Глобальный модуль, читающий конфигурацию
 * приложения из ENV файлов
 */
@Global()
@Module({
  providers: [WinstonService],
  exports: [WinstonService],
})
export class WinstonModule {}
