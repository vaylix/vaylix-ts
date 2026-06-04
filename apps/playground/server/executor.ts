import type { PlaygroundOperationId } from "../src/types.js";
import { withClient } from "./client.js";
import { executeTransactionScript, parseTransactionSteps } from "./transaction.js";
import type { ExecuteContext, OperationHandlers } from "./types.js";
import { asNumber, asRecord, asString, asStringArray } from "./utils.js";

function booleanFlag(value: unknown): boolean {
  return Boolean(value);
}

const handlers: OperationHandlers = {
  ping: async ({ url }) => withClient(url, (client) => client.ping()),
  get: async ({ url, payload }) =>
    withClient(url, (client) => client.get(asString(payload.key, "key"))),
  set: async ({ url, payload }) =>
    withClient(url, (client) =>
      client.set(asString(payload.key, "key"), asString(payload.value, "value"), {
        ...(payload.ttlSeconds !== undefined
          ? { ttlSeconds: asNumber(payload.ttlSeconds, "ttlSeconds") }
          : {}),
        ...(payload.ttlMilliseconds !== undefined
          ? { ttlMilliseconds: asNumber(payload.ttlMilliseconds, "ttlMilliseconds") }
          : {}),
        ...(payload.keepTtl !== undefined
          ? { keepTtl: booleanFlag(payload.keepTtl) }
          : {}),
        ...(payload.onlyIfMissing !== undefined
          ? { onlyIfMissing: booleanFlag(payload.onlyIfMissing) }
          : {}),
        ...(payload.onlyIfExists !== undefined
          ? { onlyIfExists: booleanFlag(payload.onlyIfExists) }
          : {}),
        ...(payload.ifVersion !== undefined
          ? { ifVersion: asNumber(payload.ifVersion, "ifVersion") }
          : {}),
        ...(payload.returnPrevious !== undefined
          ? { returnPrevious: booleanFlag(payload.returnPrevious) }
          : {}),
      }),
    ),
  del: async ({ url, payload }) =>
    withClient(url, (client) =>
      client.del(...asStringArray(payload.keys, "keys")),
    ),
  exists: async ({ url, payload }) =>
    withClient(url, (client) => client.exists(asString(payload.key, "key"))),
  mget: async ({ url, payload }) =>
    withClient(url, (client) => client.mget(asStringArray(payload.keys, "keys"))),
  mset: async ({ url, payload }) =>
    withClient(url, (client) => {
      const entries = asRecord(payload.entries, "entries");
      const normalized = Object.fromEntries(
        Object.entries(entries).map(([key, value]) => [key, asString(value, `entries.${key}`)]),
      );
      return client.mset(normalized);
    }),
  expire: async ({ url, payload }) =>
    withClient(url, (client) =>
      client.expire(
        asString(payload.key, "key"),
        asNumber(payload.seconds, "seconds"),
      ),
    ),
  ttl: async ({ url, payload }) =>
    withClient(url, (client) => client.ttl(asString(payload.key, "key"))),
  persist: async ({ url, payload }) =>
    withClient(url, (client) => client.persist(asString(payload.key, "key"))),
  info: async ({ url }) => withClient(url, (client) => client.info()),
  health: async ({ url }) => withClient(url, (client) => client.health()),
  showCluster: async ({ url }) => withClient(url, (client) => client.showCluster()),
  showReplication: async ({ url }) =>
    withClient(url, (client) => client.showReplication()),
  metrics: async ({ url }) => withClient(url, (client) => client.metrics()),
  metricsProm: async ({ url }) => withClient(url, (client) => client.metricsProm()),
  clusterJoin: async ({ url, payload }) =>
    withClient(url, (client) =>
      client.clusterJoin(
        asString(payload.nodeId, "nodeId"),
        asString(payload.address, "address"),
      ),
    ),
  clusterRemove: async ({ url, payload }) =>
    withClient(url, (client) =>
      client.clusterRemove(asString(payload.nodeId, "nodeId")),
    ),
  promoteFollower: async ({ url }) =>
    withClient(url, (client) => client.promoteFollower()),
  pauseReplication: async ({ url }) =>
    withClient(url, (client) => client.pauseReplication()),
  resumeReplication: async ({ url }) =>
    withClient(url, (client) => client.resumeReplication()),
  transactionExec: async ({ url, payload }) =>
    withClient(url, async (client) => {
      const transaction = await client.transaction();
      const steps = parseTransactionSteps(payload.steps);
      return executeTransactionScript(transaction, steps);
    }),
};

export async function executeOperation(
  operation: PlaygroundOperationId,
  context: ExecuteContext,
): Promise<unknown> {
  const handler = handlers[operation];
  if (!handler) {
    throw new RangeError(`unsupported playground operation: ${operation}`);
  }
  return handler(context);
}
