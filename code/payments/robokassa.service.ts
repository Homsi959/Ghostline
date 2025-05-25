import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  CreatedPaymentTransaction,
  PaymentRoboPayload,
  ReceiptRoboItem,
  RobokassaResult,
  SignaturePayload,
  TypeSignature,
} from './types';
import { PaymentsDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { PaymentMethod, PaymentStatus } from 'code/database/common/enums';
import { DateTime } from 'luxon';
import { AppConfig } from 'code/config/types';
import {
  CONFIG_PROVIDER_TOKEN,
  DEVELOPMENT,
  DEVELOPMENT_LOCAL,
} from 'code/common/constants';

@Injectable()
export class RobokassaService {
  private isDev: boolean;

  constructor(
    @Inject(CONFIG_PROVIDER_TOKEN)
    private readonly config: AppConfig,
    private readonly paymentsDao: PaymentsDao,
    private readonly logger: WinstonService,
  ) {
    const devVars = [DEVELOPMENT, DEVELOPMENT_LOCAL];

    this.isDev = devVars.includes(this.config.nodeEnv);
  }

  /**
   * Генерирует ссылку на оплату Robokassa по переданным данным.
   * @param payload Данные для создания платежа (сумма, описание).
   * @returns Сформированная ссылка на оплату.
   */
  async createPaymentTransaction(
    payload: PaymentRoboPayload,
  ): Promise<CreatedPaymentTransaction> {
    const { passwordCheck, culture, merchantLogin, paymentUrl } =
      this.config.robokassa;

    const { description, userId } = payload;
    const amount = this.isDev
      ? String(payload.amount)
      : Number(payload.amount).toFixed(6);
    const invId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(
      0,
      10,
    );
    const nowMoscow = DateTime.now().setZone('Europe/Moscow').toJSDate();
    const encodedReceipt = this.getEncodedReceipt({
      name: description,
      sum: amount,
    });
    const signature = this.getSignature(
      {
        password: passwordCheck,
        receipt: encodedReceipt,
        outSum: amount,
        merchantLogin: merchantLogin,
        invId,
      },
      TypeSignature.SIGPAY,
    );
    const params = new URLSearchParams({
      MerchantLogin: merchantLogin,
      OutSum: String(amount),
      InvId: invId,
      Description: description,
      Culture: culture,
      IsTest: this.isDev ? '1' : '0',
      SignatureValue: signature,
      Receipt: encodedReceipt,
    });

    const newTransaction = await this.paymentsDao.create({
      amount: Number(amount),
      currency: 'RUB',
      description,
      paymentMethod: PaymentMethod.ROBOKASSA,
      transactionId: invId,
      userId,
      createdAt: nowMoscow,
    });

    if (!newTransaction) {
      this.logger.error(`Не удалось сохранить транзакцию в БД`, this);
      throw new Error('Не удалось сохранить транзакцию');
    }

    return {
      link: `${paymentUrl}?${params.toString()}`,
      invId,
    };
  }

  /**
   * Проверяет подпись от Robokassa для входящего ResultURL.
   * @returns ID транзакции, если подпись валидна, иначе null.
   */
  async verifyTransaction({
    invId,
    signatureValue,
  }: RobokassaResult): Promise<string | null> {
    const transaction = await this.paymentsDao.find({ transactionId: invId });
    const password = this.config.robokassa.passwordPay;

    if (!transaction) {
      this.logger.warn(`Транзакция не найдена: ${invId}`, this);
      return null;
    }

    if (!password) {
      this.logger.error('Пароль ROBO_PASSWORD_CHECK не задан', this);
      return null;
    }

    const { amount, transactionId } = transaction;
    const expectedSignature = this.getSignature(
      {
        outSum: this.isDev ? String(amount) : Number(amount).toFixed(6),
        invId,
        password,
      },
      TypeSignature.SIGCHECK,
    );

    if (expectedSignature === signatureValue) {
      await this.paymentsDao.changeStatus(invId, PaymentStatus.PAID);
      this.logger.log(
        `Подпись транзакции верифицирована - ${expectedSignature}`,
        this,
      );
      return transactionId;
    }

    this.logger.error(
      `Подпись не совпала для транзакции: ${invId}. 
      expectedSignature - ${expectedSignature}
      signatureValue - ${signatureValue}`,
      this,
    );
    return null;
  }

  /**
   * Формирует и кодирует JSON-чек Robokassa для передачи в ссылке.
   * @param item Товар с названием и суммой.
   * @returns URL-кодированный JSON-объект.
   */
  private getEncodedReceipt(item: ReceiptRoboItem): string {
    const receipt = {
      sno: 'usn_income',
      items: [
        {
          ...item,
          quantity: 1,
          tax: 'none',
        },
      ],
    };

    return encodeURIComponent(JSON.stringify(receipt));
  }

  /**
   * Вычисляет подпись SignatureValue для Robokassa (MD5).
   * В зависимости от типа, применяется нужный формат и пароль.
   *
   * @param payload - входные параметры (см. SignaturePayload)
   * @param type - тип подписи (sigPay или sigCheck)
   * @returns Хеш-строка в верхнем регистре
   * @throws Если не передан пароль или тип не соответствует формату
   */
  private getSignature(payload: SignaturePayload, type: TypeSignature): string {
    const { password, invId, outSum } = payload;
    let signatureString: string;

    if (!password || password.trim() === '') {
      throw new Error(`Пароль для подписи (${type}) обязателен`);
    }

    switch (type) {
      case TypeSignature.SIGPAY: {
        const { merchantLogin, receipt } = payload;

        if (!merchantLogin) {
          throw new Error(
            'merchantLogin обязателены для подписи типа sigPay (Пароль #1)',
          );
        }

        signatureString = `${merchantLogin}:${outSum}:${invId}:${receipt}:${password}`;

        break;
      }

      case TypeSignature.SIGCHECK: {
        signatureString = `${outSum}:${invId}:${password}`;
        break;
      }

      default:
        throw new Error(`Пароль для подписи (${String(type)}) обязателен`);
    }

    return createHash('md5')
      .update(signatureString)
      .digest('hex')
      .toUpperCase();
  }
}
