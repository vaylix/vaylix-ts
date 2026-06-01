export function stringifyPreview(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function timestampId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
