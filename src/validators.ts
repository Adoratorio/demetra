/* eslint-disable @typescript-eslint/no-explicit-any */

export const validateUrl = (url: string): boolean => {
  const pattern = new RegExp(/^(http|https):\/\/[\w\-.]*(:[0-9]+)?\/\w*\/?(api)*(\.php)*$/i);
  return pattern.test(url) || url.startsWith('/');
};
