import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import {
  PaymentRoboPayload,
  ReceiptRoboItem,
  RobokassaResult,
  SignaturePayload,
  TypeSignature,
} from './types';
import { DEVELOPMENT_LOCAL, DEVELOPMENT_REMOTE } from 'code/common/constants';
import { PaymentsDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { PaymentMethod } from 'code/database/common/enums';
import { DateTime } from 'luxon';

@Injectable()
export class RobokassaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly paymentsDao: PaymentsDao,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Генерирует ссылку на оплату Robokassa по переданным данным.
   * @param payload Данные для создания платежа (сумма, описание).
   * @returns Сформированная ссылка на оплату.
   */
  async generatePaymentLink(payload: PaymentRoboPayload): Promise<string> {
    const {
      ROBO_PAYMENT_URL,
      ROBO_CULTURE,
      ROBO_MERCHANT_LOGIN,
      ROBO_PASSWORD_PAY,
      NODE_ENV,
    } = this.getRequiredEnv();
    const { amount, description, userId } = payload;
    const isDev = [DEVELOPMENT_LOCAL, DEVELOPMENT_REMOTE].includes(NODE_ENV);
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
        password: ROBO_PASSWORD_PAY,
        receipt: encodedReceipt,
        outSum: amount,
        merchantLogin: ROBO_MERCHANT_LOGIN,
        invId,
      },
      TypeSignature.SIGPAY,
    );
    const params = new URLSearchParams({
      MerchantLogin: ROBO_MERCHANT_LOGIN,
      OutSum: String(amount),
      InvId: invId,
      Description: description,
      Culture: ROBO_CULTURE,
      IsTest: isDev ? '1' : '0',
      SignatureValue: signature,
      Receipt: encodedReceipt,
    });

    const newTransaction = await this.paymentsDao.create({
      amount,
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

    return `${ROBO_PAYMENT_URL}?${params.toString()}`;
  }

  /**
   * Проверяет подпись от Robokassa для входящего ResultURL.
   * @returns ID транзакции, если подпись валидна, иначе null.
   */
  async verifyTransaction({
    invId,
    signatureValue,
  }: RobokassaResult): Promise<string | null> {
    const transaction = await this.paymentsDao.findByTransactionId(invId);
    const password = this.configService.get<string>('ROBO_PASSWORD_CHECK');

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
        outSum: amount,
        invId,
        password,
      },
      TypeSignature.SIGCHECK,
    );

    if (expectedSignature === signatureValue) {
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

  /**
   * Получает необходимые переменные окружения и проверяет их наличие.
   * @throws Ошибка, если хотя бы одна переменная не задана.
   * @returns Объект с переменными.
   */
  private getRequiredEnv() {
    const required = {
      ROBO_PAYMENT_URL: this.configService.get<string>('ROBO_PAYMENT_URL'),
      ROBO_CULTURE: this.configService.get<string>('ROBO_CULTURE'),
      ROBO_MERCHANT_LOGIN: this.configService.get<string>(
        'ROBO_MERCHANT_LOGIN',
      ),
      ROBO_PASSWORD_PAY: this.configService.get<string>('ROBO_PASSWORD_PAY'),
      NODE_ENV: this.configService.get<string>('NODE_ENV'),
    };

    for (const [key, value] of Object.entries(required)) {
      if (!value) throw new Error(`Переменная окружения ${key} не задана`);
    }

    return required as Record<keyof typeof required, string>;
  }
}
