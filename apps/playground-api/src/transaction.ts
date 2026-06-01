import type { TransactionCommandResult, VaylixTransaction } from "@vaylix/client";

import type { TransactionStep } from "./types.js";
import { asNumber, asString, asStringArray, asRecord } from "./utils.js";

export function parseTransactionSteps(value: unknown): TransactionStep[] {
  if (!Array.isArray(value)) {
    throw new TypeError("steps must be a JSON array");
  }

  return value.map((entry, index) => parseTransactionStep(entry, index));
}

function parseTransactionStep(value: unknown, index: number): TransactionStep {
  const step = asRecord(value, `steps[${index}]`);
  const op = asString(step.op, `steps[${index}].op`) as TransactionStep["op"];

  switch (op) {
    case "get":
    case "exists":
    case "ttl":
    case "persist":
      return { op, key: asString(step.key, `steps[${index}].key`) };
    case "set":
      return {
        op,
        key: asString(step.key, `steps[${index}].key`),
        value: asString(step.value, `steps[${index}].value`),
        ...(step.ttlSeconds !== undefined
          ? {
              ttlSeconds: asNumber(
                step.ttlSeconds,
                `steps[${index}].ttlSeconds`,
              ),
            }
          : {}),
        ...(step.keepTtl !== undefined
          ? { keepTtl: Boolean(step.keepTtl) }
          : {}),
      };
    case "del":
      return {
        op,
        keys: asStringArray(step.keys, `steps[${index}].keys`),
      };
    case "expire":
      return {
        op,
        key: asString(step.key, `steps[${index}].key`),
        seconds: asNumber(step.seconds, `steps[${index}].seconds`),
      };
    default:
      throw new TypeError(`unsupported transaction step op: ${String(op)}`);
  }
}

export function queueTransactionSteps(
  transaction: VaylixTransaction,
  steps: TransactionStep[],
): void {
  for (const step of steps) {
    switch (step.op) {
      case "get":
        transaction.get(step.key);
        break;
      case "set":
        transaction.set(step.key, step.value, {
          ...(step.ttlSeconds !== undefined
            ? { ttlSeconds: step.ttlSeconds }
            : {}),
          ...(step.keepTtl !== undefined ? { keepTtl: step.keepTtl } : {}),
        });
        break;
      case "del":
        transaction.del(...step.keys);
        break;
      case "exists":
        transaction.exists(step.key);
        break;
      case "expire":
        transaction.expire(step.key, step.seconds);
        break;
      case "ttl":
        transaction.ttl(step.key);
        break;
      case "persist":
        transaction.persist(step.key);
        break;
    }
  }
}

export async function executeTransactionScript(
  transaction: VaylixTransaction,
  steps: TransactionStep[],
): Promise<TransactionCommandResult[]> {
  queueTransactionSteps(transaction, steps);
  return transaction.exec();
}
