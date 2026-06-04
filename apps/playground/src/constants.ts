import type { PlaygroundOperation } from "./types";

export const categoryOrder = [
  "Connectivity",
  "Key Value",
  "Observability",
  "Cluster",
  "Transactions",
] as const satisfies readonly PlaygroundOperation["category"][];

export const defaultConnectionUrl = "vaylix://vaylix:vaylix@127.0.0.1:9173";
