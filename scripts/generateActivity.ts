import { exec } from 'child_process';
import { promisify } from 'util';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);
const NUM_CLIENTS = 50;
const INTERVAL_MS = 1000;
const TARGET_URLS = [
  'https://www.google.com',
  'https://www.cloudflare.com',
  'https://www.wikipedia.org',
  'https://www.yahoo.com',
  'https://www.bing.com',
];

const makeRequest = async (clientName: string, url: string) => {
  console.log(`🌐 ${clientName} → ${url}`);
  const command = `docker exec ${clientName} curl -x socks5h://127.0.0.1:1080 -m 5 -s -o /dev/null -w "%{http_code}" ${url}`;
  const start = performance.now();

  try {
    const { stdout } = await execAsync(command);
    const end = performance.now();
    const response = stdout.trim();
    const duration = (end - start).toFixed(2);
    console.log(`✅ ${clientName}: ${response} за ${duration} мс`);
    return Number(duration);
  } catch (e: any) {
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    console.error(`❌ ${clientName}: ошибка за ${duration} мс`);
    if (e.stdout) console.error('stdout:', e.stdout.toString());
    if (e.stderr) console.error('stderr:', e.stderr.toString());
    console.error('message:', e.message);
    return Number(duration);
  }
};

const main = async () => {
  while (true) {
    const tasks: Promise<number>[] = [];
    for (let i = 1; i <= NUM_CLIENTS; i++) {
      const clientName = `client${i}`;
      const targetUrl = TARGET_URLS[i % TARGET_URLS.length];
      tasks.push(makeRequest(clientName, targetUrl));
    }

    const durations = await Promise.all(tasks);
    const avgTime = (
      durations.reduce((a, b) => a + b, 0) / durations.length
    ).toFixed(2);

    console.log('🚀 Раунд завершён');
    console.log(`📊 Среднее время ответа: ${avgTime} мс`);

    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
};

main();
