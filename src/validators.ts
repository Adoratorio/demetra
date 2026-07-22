export function validateUrl(url: string): boolean {
  const pattern = /^https?:\/\/[\w\-.]*(?::[0-9]+)?\/\w*\/?(?:api)*(?:\.php)*$/i;
  return pattern.test(url) || url.startsWith('/');
}
