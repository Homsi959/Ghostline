import { Module } from '@nestjs/common';
import { SubscriptionDeactivationService } from './subscription-deactivation.service';
import { XrayModule } from 'code/xray/xray.module';

@Module({
  imports: [XrayModule],
  providers: [SubscriptionDeactivationService],
})
export class SubscriptionModule {}
