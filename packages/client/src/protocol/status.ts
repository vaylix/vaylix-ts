export const responseStatus = {
  Ok: 0x00,
  Error: 0x01,
  NotFound: 0x02,
} as const;

export type ResponseStatusName = keyof typeof responseStatus;
