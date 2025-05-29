import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WinstonService } from 'code/logger/winston.service';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import {
  CONFIG_PROVIDER_TOKEN,
  DEVELOPMENT_LOCAL,
} from 'code/common/constants';
import { AppConfig } from 'code/config/types';

@Injectable()
export class SshService implements OnModuleInit {
  private host: string;
  private username: string;
  private execAsync = promisify(exec);

  constructor(
    private readonly logger: WinstonService,
    @Inject(CONFIG_PROVIDER_TOKEN)
    private readonly config: AppConfig,
  ) {}

  onModuleInit() {
    if (this.config.nodeEnv === DEVELOPMENT_LOCAL) this.sshInit();
  }

  private sshInit() {
    const host = this.config.db.host;
    const username = this.config.vpsDev.username;

    this.host = host;
    this.username = username;
    this.logger.log(
      `SSH-сервис инициализирован: ${this.username}@${this.host}`,
      this,
    );
  }

  async runCommand(command: string): Promise<string> {
    const fullCommand = `ssh -i "${this.config.vpsDev.privateKeyPath}" ${this.username}@${this.host} "${command}"`;

    try {
      const { stdout, stderr } = await this.execAsync(fullCommand);

      if (stderr) {
        this.logger.warn(`stderr при выполнении команды: ${stderr}`, this);
      }

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
