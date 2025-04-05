# Ghostline

<p align="center">
  <img src="https://downloader.disk.yandex.ru/preview/bf689b0a73812d02514e1f368002e913a6ccb815cc51faa93fed13463582713b/67f178a6/Fu4uo8PRKLxPsZErg_0EMlp6KaOvtScnYN0H3ass1NwxaBv4fonP55VVJX9XFV2Q3_y2pLRjsnCfDihbdB5T-g%3D%3D?uid=0&filename=Ghostline%20logo%20%28PROD%29.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=1048x1048" alt="Ghostline Logo" />
</p>

Ghostline — коммерческий проект, построенный на [NestJS](https://nestjs.com) с использованием чистого SQL (через [pg](https://node-postgres.com/)) и [PostgreSQL](https://www.postgresql.org). Проект включает функционал для создания защищённого VPN-соединения (на базе Xray с VLESS+Reality), а также интеграцию с Telegram для управления пользователями.

---

## Основные возможности

- **Защищённое VPN-соединение:**  
  Использование современных технологий для маскировки трафика и обхода ограничений.

- **Telegram-бот для управления:**  
  Вся работа с пользователем — через Telegram: покупка, продление, генерация ключа, статус подписки.

- **Хранение и управление данными:**  
  PostgreSQL для учёта пользователей, подписок, платежей и VPN-профилей.

- **Минимальный стек:**  
  Отказ от ORM в пользу прямых SQL-запросов через DAO (data access objects) для лучшего контроля и производительности.

---

## Технологии

- **NestJS** — прогрессивный фреймворк для серверных приложений.
- **PostgreSQL** — надёжная реляционная СУБД.
- **pg** — нативный драйвер PostgreSQL для Node.js.
- **Xray (VLESS + Reality)** — технология для создания защищённых VPN-соединений.
- **Telegram API** — бот для управления действиями пользователей.
- **dotenv** — загрузка переменных окружения.

---

## Структура проекта

```plaintext
├── src/
│   ├── common/             # Утилиты, константы и типы
│   ├── dao/                # DAO-слой для SQL-запросов (вместо ORM)
│   ├── modules/            # Модули приложения (например, Telegram, VPN)
│   ├── services/           # Бизнес-логика
│   ├── database.module.ts  # Подключение и экспорт Pool (pg)
│   └── ...
├── migrations/             # SQL- или pg-migrate миграции
├── .env.development        # Переменные окружения для dev
├── .env.production         # Переменные окружения для production
└── package.json
```

---

## Конфигурация окружения

**Файл `.env.example` (шаблон):**

```ini
# Telegram
TELEGRAM_TOKEN=

# Приложение
PORT=3000
LOG_LEVEL_KEY=info

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=vpn_admin
DB_PASSWORD=your_password
DB_NAME=vpn_service_dev
```

> `.env.*` файлы добавлены в `.gitignore`. Не коммитьте реальные значения.

---

## Работа с БД

Проект использует `pg.Pool` и прямые SQL-запросы через DAO:

```ts
await this.db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### Преимущества:

- Прозрачность SQL
- Нет «магии» от ORM
- Полный контроль над производительностью и индексами

---

## Миграции

Миграции можно вести вручную или через [node-pg-migrate](https://github.com/salsita/node-pg-migrate):

### Пример команды:

```bash
npx node-pg-migrate up
```

> Конфигурация указывается в `migration.config.js` или в package.json

---

## SQL-схема (упрощённая)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telegram_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  telegram_id BIGINT UNIQUE NOT NULL,
  is_bot BOOLEAN,
  language_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- и т.д.
```

---

## Запуск проекта

- **Dev-режим:**
  ```bash
  yarn start:dev
  ```

- **Prod-сборка:**
  ```bash
  yarn start:prod
  ```

---

## Заключение

Проект Ghostline построен с упором на простоту, производительность и поддержку.  
Использование SQL напрямую через DAO даёт разработчику полный контроль, прозрачность запросов и удобство отладки.