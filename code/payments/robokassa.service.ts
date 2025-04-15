import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PaymentRoboPayload, ReceiptRoboItem, SignaturePayload } from './types';
import { DEVELOPMENT_LOCAL, DEVELOPMENT_REMOTE } from 'code/common/constants';
import { PaymentsDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';

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
  generatePaymentLink(payload: PaymentRoboPayload): string {
    const {
      ROBO_PAYMENT_URL,
      ROBO_CULTURE,
      ROBO_MERCHANT_LOGIN,
      ROBO_PASSWORD,
      NODE_ENV,
    } = this.getRequiredEnv();

    const { amount, description } = payload;
    const isDev = [DEVELOPMENT_LOCAL, DEVELOPMENT_REMOTE].includes(NODE_ENV);
    const invId = String(928374); // TODO: заменить на динамический ID при необходимости
    const encodedReceipt = this.getEncodedReceipt({
      name: description,
      sum: amount,
    });

    const signature = this.getSignature({
      password: ROBO_PASSWORD,
      receipt: encodedReceipt,
      outSum: amount,
      merchantLogin: ROBO_MERCHANT_LOGIN,
      invId,
    });

    const params = new URLSearchParams({
      MerchantLogin: ROBO_MERCHANT_LOGIN,
      OutSum: String(amount),
      InvId: invId,
      Description: description,
      Culture: ROBO_CULTURE,
      IsTest: '0',
      SignatureValue: signature,
      Receipt: encodedReceipt,
    });

    return `${ROBO_PAYMENT_URL}?${params.toString()}`;
  }

  /**
   * Проверяет существование транзакции по переданному идентификатору.
   * Используется перед отправкой ответа Robokassa на ResultURL.
   *
   * @param id - Значение transaction_id, которое передал провайдер (например, Robokassa InvId)
   * @returns Возвращает transactionId, если найдена запись, иначе null
   */
  async findTransactionIdIfExists(id: string): Promise<string | null> {
    const transaction = await this.paymentsDao.findByTransactionId(id);

    if (transaction) {
      this.logger.log(
        `✅ Транзакция найдена для подтверждения Robokassa: ${JSON.stringify(transaction)}`,
      );
      return transaction.transactionId;
    }

    this.logger.error(`⚠️ Транзакция с transactionId=${id} не найдена`);
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
   * Вычисляет хеш-подпись (SignatureValue) по алгоритму MD5.
   * @param payload Параметры для генерации подписи.
   * @returns Подписанная строка (md5-хеш).
   */
  private getSignature(payload: SignaturePayload): string {
    const { invId, receipt, password, outSum, merchantLogin } = payload;

    const signatureString = `${merchantLogin}:${outSum}:${invId}:${receipt}:${password}`;
    return createHash('md5').update(signatureString).digest('hex');
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
      ROBO_PASSWORD: this.configService.get<string>('ROBO_PASSWORD'),
      NODE_ENV: this.configService.get<string>('NODE_ENV'),
    };

    for (const [key, value] of Object.entries(required)) {
      if (!value) throw new Error(`Переменная окружения ${key} не задана`);
    }

    return required as Record<keyof typeof required, string>;
  }
}
