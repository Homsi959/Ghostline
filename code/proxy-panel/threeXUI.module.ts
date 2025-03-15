import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BASE_URL_3X_UI } from 'code/common/constants';
import { ThreeXUIService } from './threeXUI.service';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
        baseURL: configService.get<string>(BASE_URL_3X_UI),
      }),
    }),
  ],
  providers: [ThreeXUIService],
  exports: [ThreeXUIService],
})
export class ThreeXUIModule {}
