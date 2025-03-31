import { Module } from '@nestjs/common';
import { XrayClientService } from './xrayClient.service';
import { DatabaseModule } from 'code/database/database.module';
import { XrayMonitoringService } from './xrayMonitoring.service';
import { XrayHelperService } from './xrayHelper.service';
import { SshModule } from 'code/ssh/ssh.module';

/**
 * Модуль по работе с Xray
 */
@Module({
  imports: [DatabaseModule, SshModule],
  providers: [XrayHelperService, XrayClientService, XrayMonitoringService],
  exports: [XrayClientService, XrayHelperService],
})
export class XrayModule {}
