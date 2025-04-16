import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import { DEVELOPMENT_LOCAL } from 'code/common/constants';

@Injectable()
export class SshService implements OnModuleInit {
  private sshKeyPath: string;
  private host: string;
  private username: string;
  private execAsync = promisify(exec);

  constructor(
    private readonly logger: WinstonService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    if (this.configService.get<string>('NODE_ENV') == DEVELOPMENT_LOCAL)
      this.sshInit();
  }

  private sshInit() {
    const sshKeyPath = this.configService.get<string>(
      'VPS_DEV_PRIVATE_KEY_PATH',
    );
    const host = this.configService.get<string>('VPS_DEV_HOST');
    const username = this.configService.get<string>('VPS_DEV_USERNAME');

    if (!sshKeyPath || !host || !username) {
      this.logger.error('SSH параметры не заданы', this);
      throw new Error('SSH параметры не заданы');
    }

    this.sshKeyPath = path.resolve(process.cwd(), sshKeyPath);
    this.host = host;
    this.username = username;
    this.logger.log(
      `SSH-сервис инициализирован: ${this.username}@${this.host}`,
      this,
    );
  }

  async runCommand(command: string): Promise<string> {
    const fullCommand = `ssh -i "${this.sshKeyPath}" ${this.username}@${this.host} "${command}"`;

    try {
      const { stdout, stderr } = await this.execAsync(fullCommand);

      if (stderr) {
        this.logger.warn(`stderr при выполнении команды: ${stderr}`, this);
      }

      this.logger.log(
        `Команда на DEV сервере успешно выполнена: ${command.slice(0, 100)}${command.length > 100 ? '...' : ''}`,
        this,
      );
      return stdout.trim();
    } catch (error: any) {
      this.logger.error(
        `Ошибка при выполнении SSH команды: ${error.message}`,
        this,
      );
      throw new Error(`SSH команда завершилась с ошибкой: ${error.message}`);
    }
  }
}
