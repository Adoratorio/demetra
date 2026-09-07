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
