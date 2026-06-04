import type {
  PlaygroundConfigResponse,
  PlaygroundRequest,
  PlaygroundResponse,
} from "@vaylix/playground-shared";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T;
  return payload;
}

export async function fetchPlaygroundConfig(): Promise<PlaygroundConfigResponse> {
  const response = await fetch('/api/config');
  if (!response.ok) {
    throw new Error(`config request failed with ${response.status}`);
  }
  return parseJson<PlaygroundConfigResponse>(response);
}

export async function executePlaygroundOperation(
  request: PlaygroundRequest,
): Promise<PlaygroundResponse> {
  const response = await fetch('/api/execute', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return parseJson<PlaygroundResponse>(response);
}
