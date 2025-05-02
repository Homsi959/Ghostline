export interface AppConfig {
  logLevel: string;
  port: number;
  appDomain: string;
  isDev: boolean;
  telegram: {
    token: string;
    limitLengthButton: number;
  };
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  vpsDev: {
    host: string;
    username: string;
    privateKeyPath: string;
  };
  xray: {
    configPath: string;
    logsPath: string;
    flow: string;
    publicKey: string;
    listenIp: string;
    linkTag: string;
  };
  robokassa: {
    paymentUrl: string;
    merchantLogin: string;
    culture: string;
    passwordCheck: string;
    passwordPay: string;
  };
}
