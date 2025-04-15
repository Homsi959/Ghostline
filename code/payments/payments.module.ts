import { Module } from '@nestjs/common';
import { RobokassaService } from './robokassa.service';

@Module({
  providers: [RobokassaService],
  exports: [RobokassaService],
})
export class PaymentsModule {}
