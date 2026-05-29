import { v7 as uuidv7 } from 'uuid';

export function nextRequestId(): string {
  return uuidv7();
}
