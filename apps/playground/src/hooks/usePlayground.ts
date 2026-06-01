import { useEffect, useMemo, useState } from "react";

import { executePlaygroundOperation, fetchPlaygroundConfig } from "../api";
import { defaultConnectionUrl, categoryOrder } from "../constants";
import { playgroundOperations } from "../operations";
import type {
  PlaygroundOperation,
  PlaygroundOperationId,
  PlaygroundRequest,
  PlaygroundResponse,
  ResultHistoryItem,
} from "../types";
import { stringifyPreview, timestampId } from "../utils";

type ConnectionState = {
  url: string;
  hasDatabaseUrl: boolean;
};

type FieldValues = Record<string, string | number | boolean>;

type CategoryGroup = {
  category: PlaygroundOperation["category"];
  operations: PlaygroundOperation[];
};

const fallbackOperation = playgroundOperations[0]!;

function getInitialFieldValues(operation: PlaygroundOperation): FieldValues {
  return Object.fromEntries(
    operation.fields.map((field) => [field.key, operation.defaults?.[field.key] ?? ""]),
  ) as FieldValues;
}

function isPresent(value: string | number | boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return !Number.isNaN(value);
  }
  return value !== "";
}

function parseFieldValue(
  field: PlaygroundOperation["fields"][number],
  value: string | number | boolean,
): unknown {
  if (field.kind === "tags") {
    return String(value)
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (field.kind === "json") {
    try {
      return JSON.parse(String(value));
    } catch {
      return value;
    }
  }

  return value;
}

function toPayload(
  operation: PlaygroundOperation,
  fields: FieldValues,
): Record<string, unknown> {
  return Object.fromEntries(
    operation.fields
      .map((field) => [field.key, fields[field.key]] as const)
      .filter(
        (entry): entry is readonly [string, string | number | boolean] =>
          entry[1] !== undefined && isPresent(entry[1]),
      )
      .map(([key, value]) => {
        const field = operation.fields.find((entry) => entry.key === key);
        if (!field) {
          return [key, value];
        }
        return [key, parseFieldValue(field, value)];
      }),
  );
}

export function usePlayground() {
  const [connection, setConnection] = useState<ConnectionState>({
    url: defaultConnectionUrl,
    hasDatabaseUrl: false,
  });
  const [selectedOperation, setSelectedOperation] =
    useState<PlaygroundOperationId>("ping");
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ResultHistoryItem[]>([]);
  const [lastResult, setLastResult] = useState<PlaygroundResponse | null>(null);

  const operation = useMemo(
    () =>
      playgroundOperations.find((candidate) => candidate.id === selectedOperation) ??
      fallbackOperation,
    [selectedOperation],
  );

  const categories = useMemo<CategoryGroup[]>(
    () =>
      categoryOrder.map((category) => ({
        category,
        operations: playgroundOperations.filter(
          (operationItem) => operationItem.category === category,
        ),
      })),
    [],
  );

  useEffect(() => {
    setFieldValues(getInitialFieldValues(operation));
  }, [operation]);

  useEffect(() => {
    let active = true;

    void fetchPlaygroundConfig()
      .then((config) => {
        if (!active) {
          return;
        }
        setConnection((current) => ({
          url: config.databaseUrl ?? current.url,
          hasDatabaseUrl: config.hasDatabaseUrl,
        }));
      })
      .catch(() => {
        // Keep explicit defaults when the config endpoint is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  function setFieldValue(key: string, value: string | number | boolean): void {
    setFieldValues((current) => ({ ...current, [key]: value }));
  }

  function applyDefaults(): void {
    setConnection((current) => ({
      ...current,
      url: defaultConnectionUrl,
    }));
  }

  const requestPreview = useMemo<PlaygroundRequest>(
    () => {
      const trimmedUrl = connection.url.trim();
      return {
        operation: operation.id,
        payload: toPayload(operation, fieldValues),
        ...(trimmedUrl ? { url: trimmedUrl } : {}),
      };
    },
    [connection.url, fieldValues, operation],
  );

  const payloadPreview = useMemo(
    () => stringifyPreview(requestPreview.payload ?? {}),
    [requestPreview.payload],
  );

  async function executeOperation(): Promise<void> {
    setLoading(true);
    try {
      const response = await executePlaygroundOperation(requestPreview);
      const request: PlaygroundRequest = {
        operation: requestPreview.operation,
        payload: requestPreview.payload ?? {},
        ...(requestPreview.url ? { url: requestPreview.url } : {}),
      };

      const historyItem: ResultHistoryItem = {
        id: timestampId(),
        at: new Date().toISOString(),
        request,
        response,
      };
      setLastResult(response);
      setHistory((current) => [historyItem, ...current].slice(0, 12));
    } finally {
      setLoading(false);
    }
  }

  return {
    applyDefaults,
    categories,
    connection,
    executeOperation,
    fieldValues,
    history,
    lastResult,
    loading,
    operation,
    payloadPreview,
    requestPreview,
    selectedOperation,
    setConnection,
    setFieldValue,
    setSelectedOperation,
  };
}
