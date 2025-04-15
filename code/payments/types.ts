/**
 * Данные для создания ссылки на оплату Robokassa.
 */
export interface PaymentRoboPayload {
  /** Сумма платежа, например: 199.00 */
  amount: number;

  /** Назначение платежа, например: "Подписка GhostlineVPN на 1 месяц" */
  description: string;
}

/**
 * Данные одного товара для формирования чека Robokassa.
 */
export interface ReceiptRoboItem {
  /** Название товара или услуги */
  name: string;

  /** Сумма за товар или услугу */
  sum: number;
}

/**
 * Параметры для формирования подписи SignatureValue.
 */
export interface SignaturePayload {
  /** Идентификатор магазина в Robokassa */
  merchantLogin: string;

  /** Сумма платежа */
  outSum: number;

  /** Уникальный номер счёта */
  invId: string;

  /** Чек, закодированный в строку */
  receipt: string;

  /** Пароль для подписи (Пароль #1 из настроек магазина) */
  password: string;
}
