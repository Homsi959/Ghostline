import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WinstonService } from './logger/winston.service';

async function bootstrap() {
  const nest = await NestFactory.create(AppModule);

  nest.useLogger(nest.get(WinstonService));
  const PORT = Number(process.env.PORT) || 3000;
  await nest.listen(PORT);
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
}

bootstrap().catch((err: any) =>
  console.error('Не удалось запустить сервер', err),
);
