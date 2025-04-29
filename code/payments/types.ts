/**
 * Данные для создания ссылки на оплату Robokassa.
 */
export interface PaymentRoboPayload {
  /** Сумма платежа, например: 199.00 */
  amount: number;

  /** Назначение платежа, например: "Подписка GhostlineVPN на 1 месяц" */
  description: string;

  /** uuid пользователя */
  userId: string;
}

/**
 * Данные одного товара для формирования чека Robokassa.
 */
export interface ReceiptRoboItem {
  /** Название товара или услуги */
  name: string;

  /** Сумма за товар или услугу */
  sum: string;
}

/**
 * Параметры для формирования подписи SignatureValue.
 */
/**
 * Параметры для формирования подписи SignatureValue.
 */
export interface SignaturePayload {
  /** Идентификатор магазина в Robokassa (используется для подписи при отправке ссылки) */
  merchantLogin?: string;

  /** Сумма платежа в формате 0.00 */
  outSum: string;

  /** Уникальный номер счёта (обычно совпадает с transaction_id / InvId) */
  invId: string;

  /** Строка с фискальным чеком (если используется фискализация) */
  receipt?: string;

  /** Пароль для подписи (Пароль #1 или #2 из настроек Robokassa) */
  password: string;
}

export enum TypeSignature {
  SIGPAY = 'sigPay',
  SIGCHECK = 'sigCheck',
}

export interface RobokassaResult {
  invId: string;
  signatureValue: string;
}

export type CreatedPaymentTransaction = {
  link: string;
  invId: string;
};
