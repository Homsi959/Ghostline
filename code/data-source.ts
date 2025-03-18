/**
 * Этот файл создает экземпляр DataSource для подключения к базе данных с использованием TypeORM.
 * Он загружает переменные окружения из файла .env.production или .env.development,
 * в зависимости от значения переменной NODE_ENV.
 */

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { DEVELOPMENT } from './common/constants';

// Определяем, какой файл .env загрузить в зависимости от окружения
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

// Загружаем переменные окружения из выбранного файла
dotenv.config({ path: envFile });

/**
 * Экземпляр DataSource для подключения к PostgreSQL.
 * Конфигурация берет параметры подключения (хост, порт, имя пользователя, пароль и имя базы)
 * из переменных окружения, а также настраивает пути к сущностям и миграциям.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Путь к файлам сущностей (.entity.ts и .entity.js)
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  // Автоматическая синхронизация схемы включается в дев-среде
  synchronize: process.env.NODE_ENV === DEVELOPMENT,
  // Путь к файлам миграций
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  logging: false,
});
