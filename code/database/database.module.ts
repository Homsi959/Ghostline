import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDatabaseConnection } from './database.config';

/**
 * Токен сервиса БД
 */
export const DATABASE_TOKEN = 'PG_CONNECTION';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: createDatabaseConnection,
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
