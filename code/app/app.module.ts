import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from 'code/telegram/telegram.module';
import { WinstonModule } from 'code/logger/winston.module';
import { DatabaseModule } from 'code/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    TelegramModule,
    WinstonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
