import { Module } from '@nestjs/common';
import { RobokassaService } from './robokassa.service';
import { RobokassaController } from './robokassa.controller';

@Module({
  providers: [RobokassaService],
  exports: [RobokassaService],
  controllers: [RobokassaController],
})
export class PaymentsModule {}
