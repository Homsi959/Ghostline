import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

/**
 * Создание подключения к базе данных
 * @param configService Сервис конфигурации
 * @returns Пул подключений PostgreSQL
 */
export const createDatabaseConnection = (
  configService: ConfigService,
): Pool => {
  return new Pool({
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    user: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    max: 20, // максимальное количество клиентов в пуле
    idleTimeoutMillis: 30000, // время простоя соединения
    connectionTimeoutMillis: 2000, // время ожидания подключения
  });
};
