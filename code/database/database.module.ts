import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { UsersRepository } from './repository/users.repository';
import { DATABASE_TOKEN } from 'code/common/constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Pool({
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          user: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
        });
      },
    },
    UsersRepository,
  ],
  exports: [UsersRepository, DATABASE_TOKEN],
})
export class DatabaseModule {}
