import { Module } from '@nestjs/common';
import { SshService } from './ssh.service';

/**
 * Модуль нужен только для работы и тестирования с Xray
 * который поднят на VPS TimeWeb (является Dev контуром)
 */
@Module({
  providers: [SshService],
  exports: [SshService],
})
export class SshModule {}
