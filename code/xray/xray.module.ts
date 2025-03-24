import { Module } from '@nestjs/common';
import { XrayService } from './xray.service';
import { DatabaseModule } from 'code/database/database.module';

/**
 * Модуль по работе с Xray командами
 */
@Module({
  imports: [DatabaseModule],
  providers: [XrayService],
  exports: [],
})
export class XrayModule {}
