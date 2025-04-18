import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { XrayModule } from 'code/xray/xray.module';

@Module({
  imports: [XrayModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
