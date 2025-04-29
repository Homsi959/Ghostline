import { TelegramPages, TelegramButton } from './telegram.types';
import { ACTIONS_KEYS } from './telegram.actions';

/**
 * Названия страниц
 */
export const PAGE_KEYS = {
  HOME_PAGE: 'homePage', // Главная страница
  ACTIVE_USER_HOME_PAGE: 'activeUserHomePage', // Страница для клиента у которого уже есть актуальная подписка
  WITHOUT_TRIAL_HOME_PAGE: 'withoutTrialHomePage', // Главная страница для клиента который использовал уже использовал триал и подписка не активна
  ABOUT_SERVICE_PAGE: 'aboutServicePage', // Страница "О сервисе"
  SUBSCRIBING_PAGE: 'subscribingPage', // Страница подписки
  PURCHASE_OF_SUBSCRIBING_PAGE: 'purchaseOfSubscribingPage', // Страница покупки подписки
  PAYMENT_PAGE: 'paymentPage', // Страница со ссылкой на оплату
  GET_VPN_KEY_PAGE: 'getVpnKeyPage', // Страница получения VPN ключа
  HOW_TO_CONNECT_PAGE: 'howToConnectPage', // Страница со ссылками на инструкции по подключению
  ACTIVE_USER_KEY_PAGE: 'activeUserKeyPage', // Страница с ключом для клиента у которого уже есть актуальная подписка
  REPEATED_TRIAL_ATTEMPT_PAGE: 'repeatedTrialAttemptPage', // Страница где говорится о том, что клиент пытается повтороно получить триал версию
  SUBSCRIPTION_IS_EXPIRED: 'subsribitionIsExpired', // Страница о истекшей подписки
} as const;

/**
 * Тексты сообщений для различных страниц
 */
export const MESSAGES: Record<string, string> = {
  HOME_PAGE: `
<b>👋 Добро пожаловать в GhostlineVPN!</b>

Мы создали этот VPN, чтобы вы чувствовали свободу и безопасность в интернете. Никаких блокировок, ограничений и лишних шагов — только чистый доступ ко всему, что вам нужно.

<b>🎁 Первые 7 дней — бесплатно!</b>

• Видео, звонки, игры без задержек  
• Полный доступ к любимым сайтам  
• Ваша конфиденциальность под надёжной защитой  
• Подключение до 3 устройств  
• Работает на всех устройствах:  
  <b>iOS, Android, Huawei, Windows, macOS, Android TV</b>  

📌 <i>Автопродление отключено по умолчанию — вы сами решаете, продлевать ли подписку</i>
  `,

  ABOUT_SERVICE_PAGE: `
<b>🛡️ GhostlineVPN — надёжный помощник в цифровом мире</b>

<b>📄 Описание</b>

GhostlineVPN — это платный доступ к быстрому VPN-серверу в Нидерландах (Амстердам), который позволяет вам обходить блокировки, сохранять анонимность и чувствовать себя уверенно в интернете.

Подключение происходит по безопасному протоколу <code>(VLESS + Reality)</code>. Всё просто и работает сразу.

<b>💰 Тарифы:</b>  
• 7 дней бесплатно (триал)  
• 1 месяц — 190 ₽  
• 6 месяцев — 990 ₽  

<b>📞 Контакты:</b>  
• Телефон: +7 (993) 909-19-98
• Поддержка: ghostlinevpn@proton.me  
• Telegram: @GhostlineSupport
  `,

  SUBSCRIBING_PAGE: `
<b>🚀 Интернет без границ рядом — подключи GhostlineVPN за пару шагов</b>

• Доступ ко всем любимым сайтам  
• Высокая скорость без ограничений  
• Установка за минуту  

<b>📦 Выберите подходящий тариф:</b>  
  `,

  PURCHASE_OF_SUBSCRIPTION_PAGE: `
<b>💎 Наши тарифы — просто и понятно:</b>

<b>1️⃣ 1 месяц — 190 ₽</b>  
• Удобно попробовать, если вы только начинаете  

<b>2️⃣ 6 месяцев — 990 ₽</b>  
• Выгоднее в 2 раза, если уже уверены в нас ❤️  

<b>🛡️ В любой тариф включено:</b>  
• Максимальная скорость  
• Безлимитный доступ к сайтам  
• Поддержка всех устройств  

📌 Автопродление отключено по умолчанию — вы сами решаете, продлевать ли подписку

<b>Выберите тариф, который подойдёт именно вам:</b>  
  `,

  GET_VPN_KEY_PAGE: `
<b>🔐 Ваш VPN-ключ готов:</b>

<pre>{{vlessLink}}</pre>

Теперь вы можете подключиться к VPN через удобное приложение для вашего устройства.  
Если что-то пойдёт не так — мы всегда рядом.  
  `,

  HOW_TO_CONNECT_PAGE: `
<b>📲 Выберите своё устройство</b>

И мы покажем понятную инструкцию по подключению.  
  `,

  ACTIVE_USER_HOME_PAGE: `
<b>🔓 Ваша подписка активна — добро пожаловать!</b>

Спасибо, что вы с нами! Теперь у вас есть всё:

• Безлимитная скорость  
• Доступ без границ  
• Поддержка, когда нужна  
• Подключение до 3 устройств  

<b>📅 Подписка действует до: {{endDateSubscription}}</b>
`,

  PAYMENT_PAGE: `
<b>💳 Остался один шаг до свободы в интернете</b>

✨ Вы выбрали тариф — <b>«{{descriptionPlan}}»</b> на сумму {{amount}} руб.

<b>Оплатите подписку по защищенной ссылке, нажав на кнопку "Оплатить"</b>

<b>Доступные способы оплаты:</b>  
• СБП (по QR-коду или через приложение банка)  
• Банковская карта (Visa, MasterCard, Мир)  
• Tinkoff Pay  
• SberPay  

✅ Как только платёж будет подтверждён, мы сразу активируем доступ и отправим вам VPN-конфигурацию.  
  `,

  WAITING_FOR_PAYMENT_PAGE: `
<b>⏳ Ожидаем подтверждение оплаты</b>

Мы перенаправили вас на платёжную страницу Robokassa. Обычно это занимает не более минуты.

<b>🔐 Оплата проходит по защищённому каналу</b> — никаких данных не передаётся в Telegram.

Как только платёж будет подтверждён, мы сразу активируем VPN и отправим вам ключ доступа.

<b>✅ Нажмите кнопку «Я оплатил»</b>, когда завершите оплату — мы сразу проверим статус и выдадим доступ.

Если возникли сложности — напишите в поддержку, мы всегда поможем.
  `,

  PAYMENT_IS_NOT_PAID: `
❌ Платёж пока не подтверждён.

Проверьте статус в вашем банке и попробуйте ещё раз позже.

Если вы точно оплатили — напишите в поддержку.
  `,

  REPEATED_TRIAL_ATTEMPT_PAGE: `
<b>🚫 Пробный период уже использован</b>

Вы уже активировали бесплатную 7-дневную подписку ранее.

Чтобы продолжить пользоваться VPN, выберите один из доступных тарифов ниже. Это займёт меньше минуты, а свобода в интернете — бесценна!

<b>📦 Тарифы:</b>  
• 1 месяц — 190 ₽  
• 6 месяцев — 990 ₽  

Если возникли вопросы — мы всегда рядом, нажмите «Поддержка».
  `,

  SUBSCRIPTION_IS_EXPIRED: `
<b>⌛ Срок вашей подписки истёк</b>

Вы использовали весь оплаченный период, и доступ к VPN временно приостановлен.

<b>Но вы можете снова вернуться в сеть без ограничений — за считанные секунды:</b>

<b>📦 Доступные тарифы:</b>  
• 1 месяц — 190 ₽  
• 6 месяцев — 990 ₽

Нажмите кнопку ниже, чтобы продлить доступ и продолжить пользоваться GhostlineVPN.
Если возникли вопросы — наша поддержка всегда на связи.
  `,

  WITHOUT_TRIAL_HOME_PAGE: `
<b>🔐 Доступ к VPN возможен после оплаты</b>

Чтобы начать пользоваться GhostlineVPN, выберите подходящий тариф и получите полный доступ к интернету без ограничений.

<b>🚀 Вам будет доступно:</b>  
• Безлимитная скорость  
• Доступ ко всем сайтам  
• Поддержка всех устройств  
• До 3 подключений одновременно

<b>📦 Тарифы:</b>  
• 1 месяц — 190 ₽  
• 6 месяцев — 990 ₽

Нажмите на кнопку ниже, чтобы выбрать тариф и подключиться.  
Если возникли вопросы — мы всегда на связи, нажмите «Поддержка».
  `,
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
  HOME_PAGE: {
    text: '🏠 Главная',
    action: PAGE_KEYS.HOME_PAGE,
  },
  POLICY: {
    text: 'Договор оферты',
    url: 'https://disk.yandex.ru/i/S0YHz-BGWjY6sQ',
  },
  SUPPORT: {
    text: '💬 Поддержка',
    url: 'https://t.me/GhostlineSupport',
  },
  PAY: {
    text: '💳 Оплатить',
    url: '{{paymentLink}}',
  },
  CHECK_PAYMENT: {
    text: '✅ Я оплатил',
    action: ACTIONS_KEYS.CHECK_PAYMENT,
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
  [PAGE_KEYS.HOME_PAGE]: {
    message: MESSAGES.HOME_PAGE,
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
    keyboardConfig: {
      buttons: [
        BUTTONS.ACTIVATE_TRIAL,
        BUTTONS.BUY_SUBSCRIPTION,
        BUTTONS.HOME_PAGE,
      ],
      columns: 2,
    },
  },
  [PAGE_KEYS.ABOUT_SERVICE_PAGE]: {
    message: MESSAGES.ABOUT_SERVICE_PAGE,
    goBackButton: true,
  },
  [PAGE_KEYS.PURCHASE_OF_SUBSCRIBING_PAGE]: {
    message: MESSAGES.PURCHASE_OF_SUBSCRIPTION_PAGE,
    keyboardConfig: {
      buttons: [
        BUTTONS.BUY_FOR_1_MONTH,
        BUTTONS.BUY_FOR_6_MONTHS,
        BUTTONS.HOME_PAGE,
      ],
      columns: 2,
    },
  },
  [PAGE_KEYS.GET_VPN_KEY_PAGE]: {
    message: MESSAGES.GET_VPN_KEY_PAGE,
    keyboardConfig: {
      buttons: [BUTTONS.HOW_TO_CONNECT, BUTTONS.HOME_PAGE],
      columns: 1,
    },
  },
  [PAGE_KEYS.HOW_TO_CONNECT_PAGE]: {
    message: MESSAGES.HOW_TO_CONNECT_PAGE,
    keyboardConfig: {
      buttons: [
        BUTTONS.CONNECT_IOS,
        BUTTONS.CONNECT_ANDROID,
        BUTTONS.CONNECT_WINDOWS,
        BUTTONS.CONNECT_ANDROID_TV,
        BUTTONS.CONNECT_MACOS_INTEL,
        BUTTONS.CONNECT_MACOS_APPLE_SILICON,
        BUTTONS.HOME_PAGE,
      ],
      columns: 2,
    },
  },
  [PAGE_KEYS.ACTIVE_USER_HOME_PAGE]: {
    message: MESSAGES.ACTIVE_USER_HOME_PAGE,
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
    keyboardConfig: {
      buttons: [BUTTONS.HOW_TO_CONNECT, BUTTONS.HOME_PAGE],
      columns: 1,
    },
  },
  [PAGE_KEYS.PAYMENT_PAGE]: {
    message: MESSAGES.PAYMENT_PAGE,
    keyboardConfig: {
      buttons: [BUTTONS.PAY, BUTTONS.CHECK_PAYMENT, BUTTONS.HOME_PAGE],
      columns: 2,
    },
  },
  [PAGE_KEYS.REPEATED_TRIAL_ATTEMPT_PAGE]: {
    message: MESSAGES.REPEATED_TRIAL_ATTEMPT_PAGE,
    keyboardConfig: {
      buttons: [BUTTONS.BUY_SUBSCRIPTION, BUTTONS.HOME_PAGE],
      columns: 1,
    },
  },
  [PAGE_KEYS.SUBSCRIPTION_IS_EXPIRED]: {
    message: MESSAGES.SUBSCRIPTION_IS_EXPIRED,
    keyboardConfig: {
      buttons: [BUTTONS.BUY_SUBSCRIPTION, BUTTONS.HOME_PAGE],
      columns: 1,
    },
  },
  [PAGE_KEYS.WITHOUT_TRIAL_HOME_PAGE]: {
    message: MESSAGES.WITHOUT_TRIAL_HOME_PAGE,
    keyboardConfig: {
      buttons: [
        BUTTONS.BUY_SUBSCRIPTION,
        BUTTONS.ABOUT_SERVICE,
        BUTTONS.POLICY,
        BUTTONS.SUPPORT,
      ],
      columns: 2,
    },
  },
};
