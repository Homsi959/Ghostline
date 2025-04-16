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
  PAYMENT_PAGE: 'paymentPage', // Страница со ссылкой на оплату
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
<b>👋 Добро пожаловать в GhostlineVPN!</b>

Мы создали этот VPN, чтобы вы чувствовали свободу и безопасность в интернете. Никаких блокировок, ограничений и лишних шагов — только чистый доступ ко всему, что вам нужно.

<b>🎁 Первые 7 дней — бесплатно!</b>

• Видео, звонки, игры без задержек  
• Полный доступ к любимым сайтам  
• Ваша конфиденциальность под надёжной защитой
• Работает на всех устройствах:  
  <b>iOS, Android, Huawei, Windows, macOS, Android TV</b>  
    `,
  },
  ABOUT_SERVICE_PAGE: {
    text: `
<b>🛡️ GhostlineVPN — надёжный помощник в цифровом мире</b>

<b>📄 Описание</b>

GhostlineVPN — это платный доступ к быстрому VPN-серверу в Нидерландах (Амстердам), который позволяет вам обходить блокировки, сохранять анонимность и чувствовать себя уверенно в интернете.

Подключение происходит по безопасному протоколу <code>(VLESS + Reality)</code>. Всё просто и работает сразу.

<b>💰 Тарифы:</b>
• 7 дней бесплатно (триал)
• 1 месяц — 190 ₽
• 6 месяцев — 990 ₽

<b>🧾 Организация:</b>
ИП: Аль Мохамад Тарэк Зиядович
ИНН: 362709045900
ОГРНИП: 323774600275437

<b>📞 Контакты:</b>
• Телефон: +7 929 576-56-86
• E-mail: tarek18@bk.ru
• Поддержка: ghostlinevpn@proton.me
• Telegram: @HomsiDark
    `,
  },
  SUBSCRIBING_PAGE: {
    text: `
<b>🚀 Интернет без границ рядом — подключи GhostlineVPN за пару шагов</b>

• Доступ ко всем любимым сайтам
• Высокая скорость без ограничений
• Установка за минуту

<b>📦 Выберите подходящий тариф:</b>
    `,
  },
  PURCHASE_OF_SUBSCRIPTION_PAGE: {
    text: `
<b>💎 Наши тарифы — просто и понятно:</b>

<b>1️⃣ 1 месяц — 190 ₽</b>
• Удобно попробовать, если вы только начинаете

<b>2️⃣ 6 месяцев — 990 ₽</b>
• Выгоднее в 2 раза, если уже уверены в нас ❤️

<b>🛡️ В любой тариф включено:</b>
• Максимальная скорость
• Безлимитный доступ к сайтам
• Поддержка всех устройств

<b>Выберите тариф, который подойдёт именно вам:</b>
    `,
  },
  GET_VPN_KEY_PAGE: {
    text: `
<b>🔐 Ваш VPN-ключ готов:</b>

<pre>{{vlessLink}}</pre>

Теперь вы можете подключиться к VPN через удобное приложение для вашего устройства.
Если что-то пойдёт не так — мы всегда рядом.
    `,
    dependencies: ['vlessLink'],
  },
  HOW_TO_CONNECT_PAGE: {
    text: `
<b>📲 Выберите своё устройство</b>

И мы покажем понятную инструкцию по подключению.
    `,
  },
  ACTIVE_USER_HOME_PAGE: {
    text: `
<b>🔓 Ваша подписка активна — добро пожаловать!</b>

Спасибо, что вы с нами! Теперь у вас есть всё:

• Безлимитная скорость
• Доступ без границ
• Поддержка, когда нужна
    `,
  },
  PAYMENT_PAGE: {
    text: `
<b>💳 Остался один шаг до свободы в интернете</b>

✨ Вы выбрали тариф — <b>«{{plan}}»</b> на сумму {{amount}} руб.

<b>Оплатите подписку по защищенной ссылке, нажав на кнопку "Оплатить"</b>

<b>Доступные способы оплаты:</b>
• СБП (по QR-коду или через приложение банка)  
• Банковская карта (Visa, MasterCard, Мир)
• Tinkoff Pay  
• SberPay  

✅ Как только платёж будет подтверждён, мы сразу активируем доступ и отправим вам VPN-конфигурацию.
  `,
    dependencies: ['plan', 'amount'],
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
    text: 'ℹ️ Услуги и цены', // 12 символов
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
  ACTIVE_USER_HOME: {
    text: '🏠 Главная',
    action: PAGE_KEYS.ACTIVE_USER_HOME_PAGE,
  },
  POLICY: {
    text: 'Договор оферты',
    url: 'https://disk.yandex.ru/i/S0YHz-BGWjY6sQ',
  },
  SUPPORT: {
    text: '💬 Поддержка',
    url: 'https://t.me/GhostlineSupport',
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
    text: '📅 1 мес — 190₽', // 15 символов
    action: ACTIONS_KEYS.BUY_FOR_1_MONTH,
  },
  BUY_FOR_6_MONTHS: {
    text: '📆 6 мес — 990₽', // 15 символов
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
      buttons: [
        BUTTONS.SUBSCRIBING,
        BUTTONS.ABOUT_SERVICE,
        BUTTONS.POLICY,
        BUTTONS.SUPPORT,
      ],
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
    goBackButton: false,
    keyboardConfig: {
      buttons: [
        BUTTONS.CONNECT_IOS,
        BUTTONS.CONNECT_ANDROID,
        BUTTONS.CONNECT_WINDOWS,
        BUTTONS.CONNECT_ANDROID_TV,
        BUTTONS.CONNECT_MACOS_INTEL,
        BUTTONS.CONNECT_MACOS_APPLE_SILICON,
        BUTTONS.ACTIVE_USER_HOME,
      ],
      columns: 2,
    },
  },
  [PAGE_KEYS.ACTIVE_USER_HOME_PAGE]: {
    message: MESSAGES.ACTIVE_USER_HOME_PAGE,
    goBackButton: false,
    keyboardConfig: {
      buttons: [
        BUTTONS.MY_KEY,
        BUTTONS.ABOUT_SERVICE,
        BUTTONS.POLICY,
        BUTTONS.SUPPORT,
      ],
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
  [PAGE_KEYS.PAYMENT_PAGE]: {
    message: MESSAGES.PAYMENT_PAGE,
    goBackButton: true,
    keyboardConfig: {
      buttons: [],
      columns: 2,
    },
  },
};
