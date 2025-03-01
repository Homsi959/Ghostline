import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WinstonService } from './logger/winston.service';

/**
 * Запускает приложение NestJS.
 *
 * Создает приложение с `AppModule`, настраивает логгер `WinstonService` и
 * запускает сервер на порту 4000 или указанном в `process.env.PORT`.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} Обещание при успешном запуске сервера.
 *
 * @example
 * bootstrap();
 *
 * @throws {Error} Если сервер не удалось запустить.
 */
async function bootstrap(): Promise<void> {
  const nest = await NestFactory.create(AppModule);

  nest.useLogger(nest.get(WinstonService));
  const PORT = Number(process.env.PORT) || 4000;
  await nest.listen(PORT);

  const server = nest.getHttpServer() as import('http').Server;
  const address = server.address();
  if (address && typeof address !== 'string') {
    console.log(`🚀🚀🚀 Сервер запущен на http://localhost:${address.port}`);
  }
}

bootstrap().catch((err: Error) => {
  console.error('Не удалось запустить сервер', err.message);
  console.error(err.stack);
});
