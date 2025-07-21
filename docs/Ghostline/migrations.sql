-- -------------------------------------------------------------
-- TablePlus 6.4.4(604)
--
-- https://tableplus.com/
--
-- Database: vpn_service_dev
-- Generation Time: 2025-04-08 21:59:24.3610
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS payments_id_seq;

-- Table Definition
CREATE TABLE "public"."payments" (
    "id" int4 NOT NULL DEFAULT nextval('payments_id_seq'::regclass),
    "amount" numeric(10,2) NOT NULL,
    "currency" varchar(10) NOT NULL,
    "payment_method" varchar(50) NOT NULL,
    "transaction_id" varchar(100) NOT NULL,
    "status" varchar(20) NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS subscriptions_id_seq;

-- Table Definition
CREATE TABLE "public"."subscriptions" (
    "id" int4 NOT NULL DEFAULT nextval('subscriptions_id_seq'::regclass),
    "plan" varchar(50) NOT NULL,
    "start_date" timestamp NOT NULL,
    "end_date" timestamp NOT NULL,
    "status" varchar(20) NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS telegram_profiles_id_seq;

-- Table Definition
CREATE TABLE "public"."telegram_profiles" (
    "id" int4 NOT NULL DEFAULT nextval('telegram_profiles_id_seq'::regclass),
    "telegram_id" int8 NOT NULL,
    "is_bot" bool NOT NULL,
    "language_code" varchar(10),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS vpn_accounts_id_seq;

-- Table Definition
CREATE TABLE "public"."vpn_accounts" (
    "id" int4 NOT NULL DEFAULT nextval('vpn_accounts_id_seq'::regclass),
    "server" varchar(100) NOT NULL,
    "port" int4 NOT NULL,
    "public_key" varchar(100) NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "flow" varchar(50) NOT NULL,
    "sni" varchar(100) NOT NULL,
    "devices_limit" int4 NOT NULL,
    "isBlocked" bool NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."payments" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX "PK_197ab7af18c93fbb0c9b28b4a59" ON public.payments USING btree (id);
ALTER TABLE "public"."subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX "PK_a87248d73155605cf782be9ee5e" ON public.subscriptions USING btree (id);
ALTER TABLE "public"."telegram_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX "PK_0b981e1186750b1deba6bb284f0" ON public.telegram_profiles USING btree (id);
CREATE UNIQUE INDEX "UQ_2007ba8491cf77a7d2261e41b26" ON public.telegram_profiles USING btree (telegram_id);


-- Indices
CREATE UNIQUE INDEX "PK_a3ffb1c0c8416b9fc6f907b7433" ON public.users USING btree (id);
ALTER TABLE "public"."vpn_accounts" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX "PK_b95d803bc392f2a7c87e17c9cde" ON public.vpn_accounts USING btree (id);
