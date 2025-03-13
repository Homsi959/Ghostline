import { TTelegramPages, TTelegramButton } from './telegram.types';

/**
 * Названия страниц
 */
export const PAGE_KEYS = {
  MAIN_PAGE: 'mainPage',
  ABOUT_SERVICE_PAGE: 'aboutServicePage',
  SUBSCRIBING_PAGE: 'subscribingPage',
  PURCHASE_OF_SUBSCRIPTION_PAGE: 'purchaseOfSubscriptionPage',
} as const;

/**
 * Тексты сообщений
 */
const MESSAGES = {
  MAIN_PAGE: `
  🚀 Добро пожаловать в VPN будущего!
  💎 7 дней бесплатного доступа!

  Забудьте о сложностях и ограничениях — мы создали VPN, который действительно работает:
  ✅ Молниеносная скорость: стриминг в 4K, видеозвонки и игры без задержек
  ✅ Полный доступ ко всем сайтам: Instagram, YouTube, Facebook и другие платформы
  ✅ Идеальная безопасность: ваши данные надежно защищены
  ✅ Удобное подключение: простые пошаговые инструкции для любого устройства
  `,
  ABOUT_SERVICE_PAGE: `
  🔍 О нашем VPN сервисе
  
  Мы предоставляем надежный и быстрый VPN для безопасного доступа к любым сайтам:
  
  - Технология: Наш сервис использует современные протоколы шифрования для защиты вашего трафика.
  - Сервера: Размещены в нескольких странах для обеспечения стабильного и быстрого соединения.
  - Устройства: Работает на смартфонах, планшетах, компьютерах и даже на роутерах.
  - Подключение: После активации вы получите простые инструкции по настройке для любой платформы.
  
  Наша поддержка всегда готова помочь с любыми вопросами по использованию сервиса.

  🔒 Гарантия возврата денег в течение 7 дней, если качество не соответствует вашим ожиданиям.
  `,
  SUBSCRIBING_PAGE: `
  🌟 Один шаг до безграничного интернета!

  - Полный доступ ко всем функциям.
  - Высокая скорость без ограничений.
  - Поддержка всех устройств.

  Выберите вариант:
  `,
  PURCHASE_OF_SUBSCRIPTION_PAGE: `
  💎 Наши тарифы:

  1️⃣ 1 месяц — 150 рублей
    - Подключение на 30 дней с полным доступом ко всем функциям.

  2️⃣ 6 месяцев — 800 рублей
    - Подключение на 6 месяцев с максимальной выгодой!

  🔒 Все тарифы включают:
  - Высокую скорость соединения.
  - Полный доступ к интернет-ресурсам.
  - Защищенное соединение на всех устройствах.

  💳 Выберите удобный для вас тариф и подключайтесь прямо сейчас!
  `,
};

/**
 * Названия событий
 */
export const ACTIONS_KEYS = {
  ACTIVATE_FOR_7_DAYS: 'activateFor7Days',
  BUY_FOR_1_MONTH: 'buyFor1Month',
  BUY_FOR_6_MONTHS: 'buyFor6Months',
  GO_BACK: 'goBack',
} as const;

/**
 * Кнопки
 */
export const BUTTONS: Record<string, TTelegramButton> = {
  SUBSCRIBING: {
    text: 'Попробовать бесплатно',
    action: PAGE_KEYS.SUBSCRIBING_PAGE,
  },
  ABOUT_SERVICE: {
    text: 'О сервисе',
    action: PAGE_KEYS.ABOUT_SERVICE_PAGE,
  },
  ACTIVATE_FOR_7_DAYS: {
    text: 'Активировать бесплатно на 7 дней',
    action: ACTIONS_KEYS.ACTIVATE_FOR_7_DAYS,
  },
  BUY_SUBSCRIPTION: {
    text: 'Купить подписку',
    action: PAGE_KEYS.PURCHASE_OF_SUBSCRIPTION_PAGE,
  },
  BUY_FOR_1_MONTH: {
    text: '1 месяц - 150 рублей',
    action: ACTIONS_KEYS.BUY_FOR_1_MONTH,
  },
  BUY_FOR_6_MONTHS: {
    text: '6 месяцев - 800 рублей',
    action: ACTIONS_KEYS.BUY_FOR_6_MONTHS,
  },
  GO_BACK: {
    text: 'Назазд',
    action: ACTIONS_KEYS.GO_BACK,
  },
};

/**
 * Телеграм-страницы для рендера
 */
export const telegramPages: TTelegramPages = {
  [PAGE_KEYS.MAIN_PAGE]: {
    message: MESSAGES.MAIN_PAGE,
    keyboardConfig: {
      buttons: [BUTTONS.SUBSCRIBING, BUTTONS.ABOUT_SERVICE],
      columns: 2,
    },
  },
  [PAGE_KEYS.SUBSCRIBING_PAGE]: {
    message: MESSAGES.SUBSCRIBING_PAGE,
    keyboardConfig: {
      buttons: [BUTTONS.ACTIVATE_FOR_7_DAYS, BUTTONS.BUY_SUBSCRIPTION],
      columns: 2,
    },
  },
  [PAGE_KEYS.ABOUT_SERVICE_PAGE]: {
    message: MESSAGES.ABOUT_SERVICE_PAGE,
    goBackButton: true,
  },
  [PAGE_KEYS.PURCHASE_OF_SUBSCRIPTION_PAGE]: {
    message: MESSAGES.PURCHASE_OF_SUBSCRIPTION_PAGE,
    goBackButton: true,
    keyboardConfig: {
      buttons: [BUTTONS.BUY_FOR_1_MONTH, BUTTONS.BUY_FOR_6_MONTHS],
      columns: 1,
    },
  },
};
