import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { readFile } from 'fs/promises';
import { NodeSSH } from 'node-ssh';
import * as path from 'path';

@Injectable()
export class SshService {
  private ssh = new NodeSSH();

  constructor(
    private readonly logger: WinstonService,
    private readonly configService: ConfigService,
  ) {}

  async connect() {
    const vpsPrivateKeyPath = this.configService.get<string>(
      'VPS_DEV_PRIVATE_KEY_PATH',
    );
    const vpsDevHost = this.configService.get<string>('VPS_DEV_HOST');
    const vpsDevUsername = this.configService.get<string>('VPS_DEV_USERNAME');

    if (!vpsPrivateKeyPath || !vpsDevHost || !vpsDevUsername) return;

    const sshPrivateKeyAbsolutePath = path.resolve(
      process.cwd(),
      vpsPrivateKeyPath,
    );

    try {
      const sshKey = await readFile(sshPrivateKeyAbsolutePath, 'utf-8');

      await this.ssh.connect({
        host: vpsDevHost,
        username: vpsDevUsername,
        privateKey: sshKey,
      });

      this.logger.log(
        `Подключение с сервером DEV: ${vpsDevHost} по SSH установлено`,
        this,
      );
    } catch (error) {
      this.logger.error(
        `Ошибка при подключении через SSH: ${vpsDevHost}`,
        this,
      );
      throw error;
    }
  }

  async runCommand(command: string): Promise<string> {
    await this.connect();
    const result = await this.ssh.execCommand(command);

    if (result.stderr) {
      this.logger.error(
        `Не удалось выполнить команду на dev контуре по SSH: ${result.stderr}`,
        this,
      );

      throw new Error(`Ошибка: ${result.stderr}`);
    }
    return result.stdout;
  }
}
