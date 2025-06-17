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
 * Тексты сообщений для различных страниц — перезапуск PlanetVPN
 */
export const MESSAGES: Record<string, string> = {
  HOME_PAGE: `
<b>👋 Добро пожаловать в обновлённый PlanetVPN!</b>

Нас заблокировали — но мы вернулись. Теперь с новой инфраструктурой, надёжной защитой и стабильной скоростью.

<b>🎁 7 дней бесплатно — как раньше, только лучше</b>

• До <b>{{devicesLimit}}</b> устройств одновременно  
• Поддержка: <b>iOS, Android, Windows, macOS</b>  
• Видео, звонки, игры без лагов  
• Полный доступ к любимым сайтам  
• Ваши данные под надёжной защитой

📌 <i>Автопродление выключено — контроль за подпиской только у вас</i>
  `,

  ABOUT_SERVICE_PAGE: `
<b>🛡️ PlanetVPN снова с вами</b>

<b>📄 Что изменилось?</b>

Мы обновили всё — от серверов до системы защиты. Теперь PlanetVPN работает на собственной платной инфраструктуре в Нидерландах (Амстердам), гарантируя вам стабильный и быстрый доступ к интернету без ограничений.

Протокол: <code>VLESS + Reality</code> — один из самых продвинутых и устойчивых к блокировкам.

<b>💰 Тарифы:</b>  
• 7 дней бесплатно  
• 1 месяц — 190 ₽  
• 6 месяцев — 990 ₽  

<b>📞 Поддержка:</b>  
• Почта: planetvpn.official@gmail.com
  `,

  SUBSCRIBING_PAGE: `
<b>🚀 Возвращение PlanetVPN — начните прямо сейчас</b>

• Безграничный доступ ко всем сайтам  
• Высокая скорость  
• Установка за минуту

<b>📦 Выберите тариф:</b>
  `,

  PURCHASE_OF_SUBSCRIPTION_PAGE: `
<b>💎 Тарифы PlanetVPN — просто и честно:</b>

<b>1️⃣ 1 месяц — 190 ₽</b>  
• Идеально, чтобы попробовать  

<b>2️⃣ 6 месяцев — 990 ₽</b>  
• Экономия в 2 раза и максимум стабильности  

<b>🛡️ Включено в любой тариф:</b>  
• Высокая скорость  
• Безлимитный трафик  
• Работа на всех устройствах  

📌 Автопродление не включается автоматически — вы решаете, когда продлевать

<b>Выберите подходящий вариант и подключайтесь:</b>
  `,

  GET_VPN_KEY_PAGE: `
<b>🔐 Ваш VPN-ключ готов:</b>

<pre>{{vlessLink}}</pre>

Скопируйте его и подключитесь через любое удобное приложение.
  `,

  HOW_TO_CONNECT_PAGE: `
<b>📲 Как подключиться</b>

1. Установите приложение <b>Hiddify</b>  
2. Скопируйте ключ из бота  
3. В Hiddify нажмите <b>«Новый профиль»</b> → <b>«Из буфера обмена»</b>  
4. Нажмите <b>«Подключиться»</b>  
5. Готово — вы в сети
  `,

  ACTIVE_USER_HOME_PAGE: `
<b>🔓 Подписка активна — добро пожаловать в PlanetVPN</b>

Вы снова с нами. Спасибо за доверие 🙌

• Безлимитная скорость  
• Свободный доступ  
• До <b>{{devicesLimit}}</b> подключений одновременно

<b>📅 Подписка действует до: {{endDateSubscription}}</b>
  `,

  PAYMENT_PAGE: `
<b>💳 Финальный шаг — оплата подписки</b>

✨ Вы выбрали: <b>«{{descriptionPlan}}»</b> — {{amount}} ₽

<b>Нажмите "Оплатить", чтобы завершить подключение</b>

<b>Способы оплаты:</b>  
• СБП  
• Карта (Visa, MasterCard, Мир)  
• Tinkoff Pay  
• SberPay  

✅ Сразу после оплаты вы получите VPN-ключ — всё автоматически
  `,

  WAITING_FOR_PAYMENT_PAGE: `
<b>⏳ Ожидаем подтверждение</b>

Вы перешли на платёжную страницу Robokassa. Обычно подтверждение занимает не больше минуты.

<b>🔐 Оплата защищена</b> — никакие данные не передаются Telegram.

После подтверждения подписка активируется автоматически.

<b>✅ Нажмите «Я оплатил»</b>, как только завершите оплату.
  `,

  PAYMENT_IS_NOT_PAID: `
❌ Платёж не подтверждён

Проверьте статус в вашем банке или подождите немного.

Если точно оплатили — напишите в поддержку, мы проверим вручную.
  `,

  REPEATED_TRIAL_ATTEMPT_PAGE: `
<b>🚫 Пробный период уже использован</b>

Ранее вы уже активировали 7-дневный триал.

Чтобы продолжить пользоваться PlanetVPN, выберите один из тарифов. Это займёт меньше минуты, а доступ — на месяцы.

<b>📦 Тарифы:</b>  
• 1 месяц — 190 ₽  
• 6 месяцев — 990 ₽  
  `,

  SUBSCRIPTION_IS_EXPIRED: `
<b>⌛ Срок подписки завершён</b>

Ваш оплаченный период подошёл к концу.

<b>Подключиться снова — просто:</b>  
<b>📦 Тарифы:</b>  
• 1 месяц — 190 ₽  
• 6 месяцев — 990 ₽

Нажмите кнопку ниже и продолжайте пользоваться PlanetVPN.
  `,

  WITHOUT_TRIAL_HOME_PAGE: `
<b>🔐 Доступ открыт после оплаты</b>

Триал уже использован, но подключиться снова можно в любой момент.

<b>🚀 Что получите:</b>  
• Безлимитная скорость  
• Свобода доступа  
• До <b>{{devicesLimit}}</b> устройств одновременно  
• Поддержка всех платформ

<b>📦 Тарифы:</b>  
• 1 месяц — 190 ₽  
• 6 месяцев — 990 ₽  

Нажмите кнопку ниже, чтобы выбрать тариф и продолжить работу.
  `,
};

/**
 * Ссылки на инструкции для подключения
 */
export const CONNECTION_INSTRUCTIONS_LINKS = {
  HOW_TO_CONNECT_IOS:
    'https://apps.apple.com/ae/app/hiddify-proxy-vpn/id6596777532',
  HOW_TO_CONNECT_ANDROID:
    'https://play.google.com/store/apps/details?id=app.hiddify.com&pcampaignid=web_share',
  HOW_TO_CONNECT_WINDOWS:
    'https://apps.microsoft.com/detail/9pdfnl3qv2s5?hl=en-US&gl=NL',
  HOW_TO_CONNECT_MACOS:
    'https://apps.apple.com/ae/app/hiddify-proxy-vpn/id6596777532',
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
    text: '🔌 Подключение',
    action: PAGE_KEYS.HOW_TO_CONNECT_PAGE,
  },
  GO_BACK: {
    text: '🔙 Назад', // 7 символов
    action: ACTIONS_KEYS.GO_BACK,
  },
  MY_KEY: {
    text: '🔑 Мой ключ',
    action: PAGE_KEYS.ACTIVE_USER_KEY_PAGE,
  },
  HOME_PAGE: {
    text: '🏠 Главная',
    action: PAGE_KEYS.HOME_PAGE,
  },
  POLICY: {
    text: '📝 Договор оферты',
    url: 'https://disk.yandex.ru/i/_hH_O3-P0sEyyQ',
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
  CONNECT_WINDOWS: {
    text: '🖥️ Windows', // 9 символов
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_WINDOWS,
  },
  CONNECT_MACOS: {
    text: '🍏 MacOS',
    url: CONNECTION_INSTRUCTIONS_LINKS.HOW_TO_CONNECT_MACOS,
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
        BUTTONS.BUY_SUBSCRIPTION,
        BUTTONS.ABOUT_SERVICE,
        BUTTONS.POLICY,
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
        BUTTONS.CONNECT_MACOS,
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
        BUTTONS.HOW_TO_CONNECT,
        BUTTONS.ABOUT_SERVICE,
        BUTTONS.POLICY,
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
      ],
      columns: 2,
    },
  },
};
