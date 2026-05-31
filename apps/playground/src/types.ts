export type PlaygroundOperationId =
  | 'ping'
  | 'get'
  | 'set'
  | 'del'
  | 'exists'
  | 'mget'
  | 'mset'
  | 'expire'
  | 'ttl'
  | 'persist'
  | 'info'
  | 'health'
  | 'showCluster'
  | 'showReplication'
  | 'metrics'
  | 'metricsProm'
  | 'clusterJoin'
  | 'clusterRemove'
  | 'promoteFollower'
  | 'pauseReplication'
  | 'resumeReplication'
  | 'transactionExec';

export type PlaygroundFieldKind =
  | 'text'
  | 'number'
  | 'switch'
  | 'tags'
  | 'json'
  | 'textarea';

export interface PlaygroundField {
  key: string;
  label: string;
  kind: PlaygroundFieldKind;
  description: string;
  placeholder?: string;
  min?: number;
}

export interface PlaygroundOperation {
  id: PlaygroundOperationId;
  category: 'Connectivity' | 'Key Value' | 'Observability' | 'Cluster' | 'Transactions';
  title: string;
  summary: string;
  fields: PlaygroundField[];
  defaults?: Record<string, unknown>;
}

export interface PlaygroundRequest {
  url?: string;
  operation: PlaygroundOperationId;
  payload?: Record<string, unknown>;
}

export interface PlaygroundSuccessResponse {
  ok: true;
  operation: PlaygroundOperationId;
  durationMs: number;
  result: unknown;
}

export interface PlaygroundErrorResponse {
  ok: false;
  operation: PlaygroundOperationId;
  durationMs: number;
  error: {
    name: string;
    message: string;
    code?: string;
  };
}

export type PlaygroundResponse =
  | PlaygroundSuccessResponse
  | PlaygroundErrorResponse;

export interface PlaygroundConfigResponse {
  databaseUrl?: string;
  hasDatabaseUrl: boolean;
}

export interface ResultHistoryItem {
  id: string;
  at: string;
  request: PlaygroundRequest;
  response: PlaygroundResponse;
}
