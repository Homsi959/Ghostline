import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const NUM_CLIENTS = 10;
const CONFIG_TEMPLATE_PATH = path.resolve(
  __dirname,
  '../settings/configs/xray-client.config.dev.json',
);
const DOCKERFILE_PATH = path.resolve(
  __dirname,
  '../settings/configs/Dockerfile',
);
const CLIENTS_ROOT = path.resolve(__dirname, '../vpn_clients_generated');
const COMPOSE_PATH = path.resolve(__dirname, '../docker-compose.generated.yml');
const CLIENTS_LIST_PATH = path.join(CLIENTS_ROOT, 'clients.json');

const composeLines: string[] = ['services:'];
const clientsArray: { id: string; flow: string; email: string }[] = [];

const main = () => {
  if (!fs.existsSync(CONFIG_TEMPLATE_PATH)) {
    throw new Error(
      `❌ Не найден xray-client.config.dev.json по пути ${CONFIG_TEMPLATE_PATH}`,
    );
  }
  if (!fs.existsSync(DOCKERFILE_PATH)) {
    throw new Error(`❌ Не найден Dockerfile по пути ${DOCKERFILE_PATH}`);
  }

  fs.mkdirSync(CLIENTS_ROOT, { recursive: true });

  for (let i = 1; i <= NUM_CLIENTS; i++) {
    const clientName = `client${i}`;
    const clientDir = path.join(CLIENTS_ROOT, clientName);
    const configPath = path.join(clientDir, 'xray-client.config.dev.json');
    const uuid = randomUUID();

    fs.mkdirSync(clientDir, { recursive: true });

    fs.copyFileSync(DOCKERFILE_PATH, path.join(clientDir, 'Dockerfile'));

    const configTemplate = fs.readFileSync(CONFIG_TEMPLATE_PATH, 'utf-8');
    const configModified = configTemplate.replace(/uuid1/g, uuid);
    fs.writeFileSync(configPath, configModified, 'utf-8');

    composeLines.push(
      `  ${clientName}:`,
      `    build:`,
      `      context: ./vpn_clients_generated/${clientName}`,
      `    container_name: ${clientName}`,
      `    volumes:`,
      `      - ./vpn_clients_generated/${clientName}/xray-client.config.dev.json:/app/xray-client.config.dev.json`,
      `      - /etc/localtime:/etc/localtime:ro`,
      `    restart: unless-stopped`,
      '',
    );

    clientsArray.push({
      id: uuid,
      flow: 'xtls-rprx-vision',
      email: uuid,
    });

    console.log(`✅ ${clientName} создан с UUID: ${uuid}`);
  }

  fs.writeFileSync(COMPOSE_PATH, composeLines.join('\n'), 'utf-8');
  console.log(`🛠 docker-compose.generated.yml создан`);

  fs.writeFileSync(
    CLIENTS_LIST_PATH,
    JSON.stringify(clientsArray, null, 2),
    'utf-8',
  );
  console.log(`🧾 clients.json сохранён: ${CLIENTS_LIST_PATH}`);

  console.log('\n🧾 Список клиентов для Xray:');
  console.log(JSON.stringify(clientsArray, null, 2));

  // ⛴ Автоматически запускаем docker-compose
  console.log('🚀 Запуск docker compose...');
  execSync(`docker compose -f ${COMPOSE_PATH} up --build -d`, {
    stdio: 'inherit',
  });

  console.log('✅ Всё поднято!');
};

main();
