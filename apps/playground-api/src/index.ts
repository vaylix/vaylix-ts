import dotenv from 'dotenv';

import { createPlaygroundServer } from './app.js';

dotenv.config();

const host = process.env.PLAYGROUND_HOST ?? '127.0.0.1';
const port = Number(process.env.PLAYGROUND_PORT ?? '8787');

async function main(): Promise<void> {
  const server = await createPlaygroundServer();

  try {
    await server.listen({ host, port });
    console.log(`playground api listening on http://${host}:${port}`);
  } catch (error) {
    server.log.error(error);
    process.exitCode = 1;
    await server.close();
  }
}

void main();
