import { createClient, type VaylixClient } from "@vaylix/client";

export async function withClient<T>(
  url: string | undefined,
  execute: (client: VaylixClient) => Promise<T>,
): Promise<T> {
  const client = createClient(url ? { url } : {});
  try {
    await client.connect();
    return await execute(client);
  } finally {
    await client.close();
  }
}
