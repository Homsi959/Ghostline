import { Global, Module } from '@nestjs/common';
import { CONFIG_PROVIDERS } from './config.providers';

/**
 * Глобальный модуль, читающий конфигурацию
 * приложения из KV-хранилища consul
 */
@Global()
@Module({
  providers: CONFIG_PROVIDERS,
  exports: CONFIG_PROVIDERS,
})
export class ConfigModule {}
