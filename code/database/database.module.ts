import { Module, Global } from '@nestjs/common';

/**
 * Глобальный модуль базы данных.
 *
 * Этот модуль настраивает подключение к PostgreSQL,
 * загружая переменные окружения из соответствующего файла (.env.development или .env.production).
 * Он также предоставляет репозитории для работы с сущностями.
 */
@Global()
@Module({})
export class DatabaseModule {}
