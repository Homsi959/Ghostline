import { Module } from '@nestjs/common';
import { XrayService } from './xray.service';

/**
 * Модуль по работе с Xray командами
 */
@Module({
  imports: [],
  providers: [XrayService],
  exports: [],
})
export class XrayModule {}
