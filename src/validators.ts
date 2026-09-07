import { type WpData, type WpFile } from './types.ts';

// Absolute http(s) URLs of any shape, or a root-relative path (resolved by the
// browser against the current origin)
export function validateUrl(url: string): boolean {
  if (url.startsWith('/')) {
    return true;
  }
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function hasStatus(value: unknown): value is { status: { code: number; message: string } } {
  if (typeof value !== 'object' || value === null || !('status' in value)) {
    return false;
  }
  const { status } = value as { status: unknown };
  return (
    typeof status === 'object' &&
    status !== null &&
    typeof (status as { code?: unknown }).code === 'number' &&
    typeof (status as { message?: unknown }).message === 'string'
  );
}

// Minimal envelope checks: the generic `data` is left to the caller
export function isWpData(value: unknown): value is WpData {
  return hasStatus(value) && 'data' in value;
}

export function isWpFile(value: unknown): value is WpFile {
  if (!hasStatus(value) || !('data' in value)) {
    return false;
  }
  const { data } = value as { data: unknown };
  return (
    typeof data === 'object' && data !== null && typeof (data as { url?: unknown }).url === 'string'
  );
}
