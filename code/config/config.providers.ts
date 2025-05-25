import { CONFIG_PROVIDER_TOKEN } from 'code/common/constants';
import { AppConfig } from './types';

/**
 * Провайдер конфигурации для .env значений
 */
export const CONFIG_PROVIDERS = [
  {
    provide: CONFIG_PROVIDER_TOKEN,
    useFactory: (): AppConfig => ({
      logLevel: process.env.LOG_LEVEL_KEY ?? 'info',
      port: +(process.env.PORT ?? 3000),
      nodeEnv: process.env.NODE_ENV!,
      devicesLimit: Number(process.env.DEVICES_LIMIT!),

      telegram: {
        token: process.env.TELEGRAM_TOKEN!,
        limitLengthButton: +(process.env.LIMIT_LENGTH_BUTTON ?? 16),
      },

      db: {
        host: process.env.DB_HOST!,
        port: +(process.env.DB_PORT ?? 5432),
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
      },

      vpsDev: {
        host: process.env.VPS_DEV_HOST!,
        username: process.env.VPS_DEV_USERNAME!,
        privateKeyPath: process.env.VPS_DEV_PRIVATE_KEY_PATH!,
      },

      xray: {
        configPath: process.env.XRAY_CONFIG_PATH!,
        logsPath: process.env.XRAY_LOGS_PATH!,
        flow: process.env.XRAY_FLOW!,
        publicKey: process.env.XRAY_PUBLIC_KEY!,
        listenAddress: process.env.XRAY_LISTEN_ADDRESS!,
        linkTag: process.env.XRAY_LINK_TAG!,
        sni: process.env.XRAY_SNI!,
      },

      robokassa: {
        paymentUrl: process.env.ROBO_PAYMENT_URL!,
        merchantLogin: process.env.ROBO_MERCHANT_LOGIN!,
        culture: process.env.ROBO_CULTURE!,
        passwordCheck: process.env.ROBO_PASSWORD_PAY!,
        passwordPay: process.env.ROBO_PASSWORD_CHECK!,
      },
    }),
  },
];
