import { execSync } from 'child_process';

const NUM_CLIENTS = 10;
const TARGET_URL = 'https://www.google.com';

for (let i = 1; i <= NUM_CLIENTS; i++) {
  const clientName = `client${i}`;
  console.log(`🌐 Отправка запроса от ${clientName}...`);
  try {
    const command = `docker exec ${clientName} curl -x socks5h://127.0.0.1:1080 -m 5 -s -o /dev/null -w "%{http_code}" ${TARGET_URL}`;
    const response = execSync(command, { stdio: 'pipe' }).toString().trim();
    console.log(`✅ ${clientName}: ответ ${response}`);
  } catch (e: any) {
    console.error(`❌ ${clientName}: ошибка запроса`);
    if (e.stdout) console.error('stdout:', e.stdout.toString());
    if (e.stderr) console.error('stderr:', e.stderr.toString());
    console.error('message:', e.message);
  }
}
