import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@vaylix/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv({ path: path.resolve(__dirname, '../../../.env') });

async function main(): Promise<void> {
  const client = createClient();
  await client.connect();
  try {
    console.log(await client.ping());
    await client.set('playground:key', 'hello');
    console.log(await client.get('playground:key'));
    console.log(await client.info());
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
