# VPN Service

<p align="center">
  <img src="https://via.placeholder.com/600x150?text=VPN+Service" alt="VPN Service Logo" />
</p>

VPN Service — коммерческий проект, построенный на [NestJS](https://nestjs.com) с использованием [TypeORM](https://typeorm.io) и [PostgreSQL](https://www.postgresql.org). Проект включает функционал для создания защищённого VPN-соединения (на базе Xray с VLESS+Reality), а также интеграцию с Telegram для управления пользователями.

---

## Основные возможности

- **Защищённое VPN-соединение:**  
  Использование современных технологий для маскировки трафика и обхода ограничений.
  
- **Управление пользователями и учетными записями:**  
  Хранение данных о пользователях, платежах, подписках, Telegram-профилях и VPN-аккаунтах в базе PostgreSQL.

- **Контролируемые миграции:**  
  Система миграций с TypeORM обеспечивает фиксацию изменений в схеме базы данных, позволяя безопасно обновлять её в production.

- **Интеграция с Telegram:**  
  Управление пользователями и уведомления через Telegram-бота.

---

## Технологии

<ul>
  <li><strong>NestJS:</strong> фреймворк для серверных приложений на Node.js.</li>
  <li><strong>TypeORM:</strong> ORM для TypeScript, позволяющая работать с БД через объектную модель.</li>
  <li><strong>PostgreSQL:</strong> реляционная СУБД для надежного хранения данных.</li>
  <li><strong>Xray (VLESS+Reality):</strong> технология для создания защищенных VPN-соединений.</li>
  <li><strong>Telegram API:</strong> для интеграции с Telegram и управления пользователями.</li>
</ul>

---

## Структура проекта

```plaintext
├── src/
│   ├── common/             # Константы и утилиты (например, DEVELOPMENT)
│   ├── entities/           # Сущности базы данных (UserEntity, PaymentEntity, SubscriptionEntity, TelegramProfileEntity, VpnAccountEntity)
│   ├── modules/            # Модули приложения (например, DatabaseModule, TelegramModule)
│   ├── repository/         # Репозитории для работы с БД
│   ├── data-source.ts      # Конфигурация подключения к БД для TypeORM CLI
│   └── ...
├── migrations/             # Миграционные файлы для обновления схемы базы данных
├── .env.development        # Переменные окружения для разработки
├── .env.production         # Переменные окружения для production
└── package.json
```

---

## Конфигурация окружения

Проект использует переменные окружения для подключения к базе данных и настройки приложения. Файлы:

- **.env.development** – для разработки  
- **.env.production** – для production

**Пример `.env.development`:**

```ini
# Общие ключи
TELEGRAM_TOKEN=7643586910:AAHNLpZvycLtOBi5kDfEorfP3rRjr7U88BA
LOG_LEVEL_KEY=info
PORT=3000

# Данные для подключения к БД PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=vpn_admin
DB_PASSWORD=HomsiDark
DB_NAME=vpn_service_dev
```

> **Важно:** Файлы `.env.*` не должны попадать в репозиторий. Вместо них храните шаблон, например, `.env.example`.

---

## Миграции базы данных

Миграции фиксируют изменения в схеме базы данных и позволяют управлять версией схемы.  
Основные команды (с Yarn):

- **Генерация миграции:**
  ```bash
  yarn typeorm migration:generate src/migrations/InitialMigration --dataSource code/data-source.ts
  ```
  _Примечание:_ Если изменений не обнаружено, можно создать пустую миграцию:
  ```bash
  yarn typeorm migration:create src/migrations/InitialMigration --dataSource code/data-source.ts
  ```

- **Применение миграций:**
  ```bash
  yarn typeorm migration:run --dataSource code/data-source.ts
  ```

- **Откат миграций:**
  ```bash
  yarn typeorm migration:revert --dataSource code/data-source.ts
  ```

---

## Полная схема базы данных

Ниже приведены SQL-скрипты для создания таблиц, которые отражены в сущностях проекта:

### Таблица `users`

```sql
CREATE TABLE users (
    id         UUID NOT NULL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `payments`

```sql
CREATE TABLE payments (
    id             SERIAL PRIMARY KEY,
    user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    amount         NUMERIC(10, 2),
    currency       VARCHAR(10),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status         VARCHAR(20) CHECK (status IN ('pending', 'successful', 'failed')),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `subscriptions`

```sql
CREATE TABLE subscriptions (
    id         SERIAL PRIMARY KEY,
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    plan       VARCHAR(50) CHECK (plan IN ('trial', '1_month', '6_months')),
    start_date TIMESTAMP,
    end_date   TIMESTAMP,
    status     VARCHAR(20) CHECK (status IN ('active', 'expired', 'canceled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `telegram_profiles`

```sql
CREATE TABLE telegram_profiles (
    id                  SERIAL PRIMARY KEY,
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    telegram_id         BIGINT UNIQUE NOT NULL,
    is_bot              BOOLEAN,
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    username            VARCHAR(50),
    language_code       VARCHAR(10),
    is_premium          BOOLEAN,
    added_to_attachment_menu BOOLEAN,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `vpn_accounts`

```sql
CREATE TABLE vpn_accounts (
    id              SERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    uuid_connection VARCHAR(36) UNIQUE,
    server          VARCHAR(100),
    port            INTEGER,
    public_key      VARCHAR(100),
    sni             VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Запуск приложения

- **Для разработки:**
  ```bash
  yarn start:dev
  ```
- **Для production:**
  ```bash
  yarn start:prod
  ```

---

## Развертывание

При деплое:
- Настройте переменные окружения через секреты или системные переменные.
- Применяйте миграции базы данных перед запуском приложения.
- Интегрируйте процесс миграций в CI/CD для контроля версий и безопасного обновления схемы.

---

## Заключение

VPN Service демонстрирует современные подходы к созданию коммерческого VPN-сервиса. Используя NestJS, TypeORM и PostgreSQL, проект обеспечивает масштабируемость, безопасность и легкость поддержки. Система миграций и модульная архитектура позволяют контролировать изменения схемы базы данных и быстро обновлять приложение в разных окружениях.

---

*Если у вас возникнут вопросы или предложения, пожалуйста, создайте issue или свяжитесь с разработчиками проекта.*