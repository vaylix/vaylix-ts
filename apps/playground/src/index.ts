import { createClient } from '@vaylix/client';

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
