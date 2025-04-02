import { TelegramPages, TelegramButton } from './telegram.types';
import { ACTIONS_KEYS } from './telegram.actions';

/**
 * Названия страниц
 */
export const PAGE_KEYS = {
  MAIN_PAGE: 'mainPage', // Главная страница
  ABOUT_SERVICE_PAGE: 'aboutServicePage', // Страница "О сервисе"
  SUBSCRIBING_PAGE: 'subscribingPage', // Страница подписки
  PURCHASE_OF_SUBSCRIBING_PAGE: 'purchaseOfSubscribingPage', // Страница покупки подписки
  GET_VPN_KEY_PAGE: 'getVpnKeyPage', // Страница получения VPN ключа
  HOW_TO_CONNECT_PAGE: 'howToConnectPage', // Страница со ссылками на инструкции по подключению
} as const;

/**
 * Тексты сообщений для различных страниц
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
  
🤝 Наша поддержка всегда готова помочь с любыми вопросами по использованию сервиса.
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
  GET_VPN_KEY_PAGE: `
🔐 Ваш VPN ключ:

<pre>{{vlessLink}}</pre>

Теперь вы можете подключиться к VPN, используя разные приложения в зависимости от вашего устройства:
  `,
  HOW_TO_CONNECT_PAGE: `
  Выбирете свое устройство и у вас откроется статья с инструкцией
  `,
};

/**
 * // TODO перекинуть в env
 * Ссылки на инструкции для подключения
 */
export const CONNECTION_INSTRUCTIONS_LINKS = {
  HOW_TO_CONNECT_IOS: 'https://teletype.in/@shield_vpn/android',
  HOW_TO_CONNECT_ANDROID: 'https://teletype.in/@shield_vpn/android',
  HOW_TO_CONNECT_ANDROID_TV: 'https://teletype.in/@shield_vpn/android',
  HOW_TO_CONNECT_WINDOWS: 'https://teletype.in/@shield_vpn/android',
  HOW_TO_CONNECT_MACOS: 'https://teletype.in/@shield_vpn/android',
} as const;

/**
 * Кнопки для взаимодействия с пользователем
 */
export const BUTTONS: Record<string, TelegramButton> = {
  SUBSCRIBING: {
    text: 'Пробный доступ', // Попробовать бесплатно
    action: PAGE_KEYS.SUBSCRIBING_PAGE,
  },
  ABOUT_SERVICE: {
    text: 'О сервисе',
    action: PAGE_KEYS.ABOUT_SERVICE_PAGE,
  },
  ACTIVATE_TRIAL: {
    text: 'Актив. на 7 дней', // Активировать бесплатно на 7 дней
    action: ACTIONS_KEYS.ACTIVATE_TRIAL,
  },
  BUY_SUBSCRIPTION: {
    text: 'Купить доступ', // Купить подписку
    action: PAGE_KEYS.PURCHASE_OF_SUBSCRIBING_PAGE,
  },
  BUY_FOR_1_MONTH: {
    text: '1 мес — 150 ₽',
    action: ACTIONS_KEYS.BUY_FOR_1_MONTH,
  },
  BUY_FOR_6_MONTHS: {
    text: '6 мес — 800 ₽',
    action: ACTIONS_KEYS.BUY_FOR_6_MONTHS,
  },
  HOW_TO_CONNECT: {
    text: 'Как подключить?',
    action: PAGE_KEYS.HOW_TO_CONNECT_PAGE,
  },
  // Кнопки с инструкциями подключения
  CONNECT_IOS: {
    text: 'IOS',
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_IOS,
  },
  CONNECT_ANDROID: {
    text: 'ANDROID',
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_ANDROID,
  },
  CONNECT_ANDROID_TV: {
    text: 'ANDROID_TV',
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_ANDROID_TV,
  },
  CONNECT_WINDOWS: {
    text: 'WINDOWS',
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_WINDOWS,
  },
  CONNECT_MACOS: {
    text: 'MACOS',
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_MACOS,
  },
  // Кнопки с инструкциями подключения
  GO_BACK: {
    text: 'Назад',
    action: ACTIONS_KEYS.GO_BACK,
  },
};

/**
 * Структура страниц для рендера в Telegram, включая сообщения и кнопки
 */
export const telegramPages: TelegramPages = {
  [PAGE_KEYS.MAIN_PAGE]: {
    message: MESSAGES.MAIN_PAGE,
    keyboardConfig: {
      buttons: [BUTTONS.SUBSCRIBING, BUTTONS.ABOUT_SERVICE],
      columns: 2,
    },
  },
  [PAGE_KEYS.SUBSCRIBING_PAGE]: {
    message: MESSAGES.SUBSCRIBING_PAGE,
    goBackButton: true,
    keyboardConfig: {
      buttons: [BUTTONS.ACTIVATE_TRIAL, BUTTONS.BUY_SUBSCRIPTION],
      columns: 2,
    },
  },
  [PAGE_KEYS.ABOUT_SERVICE_PAGE]: {
    message: MESSAGES.ABOUT_SERVICE_PAGE,
    goBackButton: true,
  },
  [PAGE_KEYS.PURCHASE_OF_SUBSCRIBING_PAGE]: {
    message: MESSAGES.PURCHASE_OF_SUBSCRIPTION_PAGE,
    goBackButton: true,
    keyboardConfig: {
      buttons: [BUTTONS.BUY_FOR_1_MONTH, BUTTONS.BUY_FOR_6_MONTHS],
      columns: 2,
    },
  },
  [PAGE_KEYS.GET_VPN_KEY_PAGE]: {
    message: MESSAGES.GET_VPN_KEY_PAGE,
    goBackButton: true,
    keyboardConfig: {
      buttons: [BUTTONS.HOW_TO_CONNECT],
      columns: 1,
    },
  },
  [PAGE_KEYS.HOW_TO_CONNECT_PAGE]: {
    message: MESSAGES.HOW_TO_CONNECT_PAGE,
    goBackButton: true,
    keyboardConfig: {
      buttons: [
        BUTTONS.CONNECT_IOS,
        BUTTONS.CONNECT_ANDROID,
        BUTTONS.CONNECT_WINDOWS,
        BUTTONS.CONNECT_MACOS,
        BUTTONS.CONNECT_ANDROID_TV,
      ],
      columns: 2,
    },
  },
};
