import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonService } from 'code/logger/winston.service';
import { NodeSSH } from 'node-ssh';

@Injectable()
export class SshService {
  private ssh = new NodeSSH();

  constructor(
    private readonly logger: WinstonService,
    private readonly configService: ConfigService,
  ) {}

  async connect() {
    const sshKey = this.configService.get<string>('SSH_KEY');

    if (!sshKey) return;

    await this.ssh.connect({
      host: '147.45.229.219',
      username: 'root',
      privateKey: sshKey,
    });
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
