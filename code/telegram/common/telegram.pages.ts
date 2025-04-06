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
  ACTIVE_USER_HOME_PAGE: 'activeUserHomePage', // Страница для клиента у которого уже есть актуальная подписка
  ACTIVE_USER_KEY_PAGE: 'activeUserKeyPage', // Страница с ключом для клиента у которого уже есть актуальная подписка
} as const;

/**
 * Тексты сообщений для различных страниц
 */
const MESSAGES: Record<string, { text: string; dependencies?: string[] }> = {
  MAIN_PAGE: {
    text: `
  🚀 Добро пожаловать в VPN будущего!
💎 7 дней бесплатного доступа!

Забудьте о сложностях и ограничениях — мы создали VPN, который действительно работает:

✅ Молниеносная скорость: стриминг в 4K, видеозвонки и игры без задержек

✅ Полный доступ ко всем сайтам: Instagram, YouTube, Facebook и другие платформы

✅ Идеальная безопасность: ваши данные надежно защищены

✅ Удобное подключение: простые пошаговые инструкции для любого устройства
  `,
  },
  ABOUT_SERVICE_PAGE: {
    text: `
  🔍 О нашем VPN сервисе
  
Мы предоставляем надежный и быстрый VPN для безопасного доступа к любым сайтам:
  
- Технология: Наш сервис использует современные протоколы шифрования для защиты вашего трафика.

- Сервера: Размещены в нескольких странах для обеспечения стабильного и быстрого соединения.

- Устройства: Работает на смартфонах, планшетах, компьютерах и даже на роутерах.

- Подключение: После активации вы получите простые инструкции по настройке для любой платформы.
  
🤝 Наша поддержка всегда готова помочь с любыми вопросами по использованию сервиса.
🔒 Гарантия возврата денег в течение 7 дней, если качество не соответствует вашим ожиданиям.
  `,
  },
  SUBSCRIBING_PAGE: {
    text: `
  🌟 Один шаг до безграничного интернета!

  - Полный доступ ко всем функциям.
  - Высокая скорость без ограничений.
  - Поддержка всех устройств.

  Выберите вариант:
  `,
  },
  PURCHASE_OF_SUBSCRIPTION_PAGE: {
    text: `
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
  },
  GET_VPN_KEY_PAGE: {
    text: `
🔐 Ваш VPN ключ:

<pre>{{vlessLink}}</pre>

Теперь вы можете подключиться к VPN, используя разные приложения в зависимости от вашего устройства:
  `,
    dependencies: ['vlessLink'],
  },
  HOW_TO_CONNECT_PAGE: {
    text: `
    Выбирете свое устройство и у вас откроется статья с инструкцией
    `,
  },
  ACTIVE_USER_HOME_PAGE: {
    text: `
  🔓 У вас активна подписка!

Вы в числе наших премиум-пользователей. Спасибо, что выбрали нас 🙌
Теперь у вас есть полный доступ ко всем функциям сервиса:

✅ Безлимитная скорость
✅ Защищённое соединение
✅ Поддержка всех устройств
  `,
  },
};

/**
 * // TODO перекинуть в env
 * Ссылки на инструкции для подключения
 */
export const CONNECTION_INSTRUCTIONS_LINKS = {
  HOW_TO_CONNECT_IOS: 'https://teletype.in/@ghostline/iOS',
  HOW_TO_CONNECT_ANDROID: 'https://teletype.in/@ghostline/Android',
  HOW_TO_CONNECT_ANDROID_TV: 'https://teletype.in/@ghostline/android-tv',
  HOW_TO_CONNECT_WINDOWS: 'https://teletype.in/@ghostline/Windows',
  HOW_TO_CONNECT_MACOS_APPLE_SILICON:
    'https://teletype.in/@ghostline/MacOS-Apple_Silicon',
  HOW_TO_CONNECT_MACOS_INTEL: 'https://teletype.in/@ghostline/MacOS-Intel',
  HOW_TO_CONNECT_HUAWEI: 'https://teletype.in/@ghostline/Huawei',
} as const;

/**
 * Кнопки для взаимодействия с пользователем
 */
export const BUTTONS: Record<string, TelegramButton> = {
  SUBSCRIBING: {
    text: '🎁 Демо-доступ', // 13 символов
    action: PAGE_KEYS.SUBSCRIBING_PAGE,
  },
  ABOUT_SERVICE: {
    text: 'ℹ️ О сервисе', // 12 символов
    action: PAGE_KEYS.ABOUT_SERVICE_PAGE,
  },
  HOW_TO_CONNECT: {
    text: '🔌 Подключение', // 14 символов
    action: PAGE_KEYS.HOW_TO_CONNECT_PAGE,
  },
  GO_BACK: {
    text: '🔙 Назад', // 7 символов
    action: ACTIONS_KEYS.GO_BACK,
  },
  MY_KEY: {
    text: '🔑 Мой ключ', // 11 символов
    action: PAGE_KEYS.ACTIVE_USER_KEY_PAGE,
  },

  // Кнопки оформление подписки
  ACTIVATE_TRIAL: {
    text: '🆓 7 дней пробно', // 15 символов
    action: ACTIONS_KEYS.ACTIVATE_TRIAL,
  },
  BUY_SUBSCRIPTION: {
    text: '💳 Купить доступ', // 15 символов
    action: PAGE_KEYS.PURCHASE_OF_SUBSCRIBING_PAGE,
  },
  BUY_FOR_1_MONTH: {
    text: '📅 1 мес — 150₽', // 15 символов
    action: ACTIONS_KEYS.BUY_FOR_1_MONTH,
  },
  BUY_FOR_6_MONTHS: {
    text: '📆 6 мес — 800₽', // 15 символов
    action: ACTIONS_KEYS.BUY_FOR_6_MONTHS,
  },

  // Кнопки с инструкциями подключения
  CONNECT_IOS: {
    text: '📱 iOS', // 5 символов
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_IOS,
  },
  CONNECT_ANDROID: {
    text: '🤖 Android', // 9 символов
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_ANDROID,
  },
  CONNECT_ANDROID_TV: {
    text: '📺 Android TV', // 13 символов
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_ANDROID_TV,
  },
  CONNECT_WINDOWS: {
    text: '🖥️ Windows', // 9 символов
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_WINDOWS,
  },
  CONNECT_MACOS_INTEL: {
    text: '🍏 MacOS Intel', // 14 символов
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_MACOS_INTEL,
  },
  CONNECT_MACOS_APPLE_SILICON: {
    text: '🍏 MacOS Apple M', // 13 символов
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_MACOS_APPLE_SILICON,
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
    goBackButton: false,
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
        BUTTONS.CONNECT_ANDROID_TV,
        BUTTONS.CONNECT_MACOS_INTEL,
        BUTTONS.CONNECT_MACOS_APPLE_SILICON,
      ],
      columns: 2,
    },
  },
  [PAGE_KEYS.ACTIVE_USER_HOME_PAGE]: {
    message: MESSAGES.ACTIVE_USER_HOME_PAGE,
    goBackButton: false,
    keyboardConfig: {
      buttons: [BUTTONS.MY_KEY, BUTTONS.ABOUT_SERVICE],
      columns: 2,
    },
  },
  [PAGE_KEYS.ACTIVE_USER_KEY_PAGE]: {
    message: MESSAGES.GET_VPN_KEY_PAGE,
    goBackButton: true,
    keyboardConfig: {
      buttons: [BUTTONS.HOW_TO_CONNECT],
      columns: 2,
    },
  },
};
