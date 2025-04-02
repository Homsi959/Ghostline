import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const COMPOSE_PATH = path.resolve(__dirname, '../docker-compose.generated.yml');
const CLIENTS_ROOT = path.resolve(__dirname, '../vpn_clients_generated');
const XRAY_CONFIG_PATH = path.resolve(
  __dirname,
  '../settings/configs/xray.config.dev.json',
);

try {
  // 1. Остановить и удалить контейнеры
  if (fs.existsSync(COMPOSE_PATH)) {
    console.log('🛑 Остановка и удаление контейнеров...');
    execSync(`docker compose -f ${COMPOSE_PATH} down`, { stdio: 'inherit' });
  }

  // 2. Удалить файл docker-compose.generated.yml
  if (fs.existsSync(COMPOSE_PATH)) {
    fs.unlinkSync(COMPOSE_PATH);
    console.log('🗑️ Удалён docker-compose.generated.yml');
  }

  // 3. Удалить папку vpn_clients_generated
  if (fs.existsSync(CLIENTS_ROOT)) {
    fs.rmSync(CLIENTS_ROOT, { recursive: true, force: true });
    console.log('🗑️ Удалена папка vpn_clients_generated');
  }

  // 4. Очистить clients[] в конфиге Xray
  if (fs.existsSync(XRAY_CONFIG_PATH)) {
    const configRaw = fs.readFileSync(XRAY_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configRaw);

    if (
      config?.inbounds?.[0]?.settings?.clients &&
      Array.isArray(config.inbounds[0].settings.clients)
    ) {
      config.inbounds[0].settings.clients = [];
      fs.writeFileSync(
        XRAY_CONFIG_PATH,
        JSON.stringify(config, null, 2),
        'utf-8',
      );
      console.log('✅ Очищен clients[] в конфиге Xray');
    } else {
      console.warn('⚠️ Не удалось найти clients[] для очистки');
    }
  }
} catch (error: any) {
  console.error('❌ Ошибка при очистке:', error.message);
}
