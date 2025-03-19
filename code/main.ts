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
  const nest = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  nest.useLogger(nest.get(WinstonService));
  const PORT = Number(process.env.PORT) || 4000;
  console.log(
    `\x1b[36m\x1b[1m🚀🚀🚀 Сервер запущен на http://localhost:${PORT} 🚀🚀🚀\x1b[0m`,
  );

  await nest.listen(PORT);
}

bootstrap().catch((err: Error) => {
  console.error('Не удалось запустить сервер', err.message);
  console.error(err.stack);
});
