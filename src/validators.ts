/* eslint-disable @typescript-eslint/no-explicit-any */

export const validateUrl = (url: string): boolean => {
  const pattern = new RegExp(/^(http|https):\/\/[\w\-.]*(:[0-9]+)?\/?(api)*(\.php)*$/i);
  return pattern.test(url);
};

export const isBlob = (value : any) : boolean =>
  value &&
  typeof value.size === 'number' &&
  typeof value.type === 'string' &&
  typeof value.slice === 'function';

export const isFile = (value : any) : boolean =>
  isBlob(value) &&
  typeof value.name === 'string' &&
  (typeof value.lastModifiedDate === 'object' ||
    typeof value.lastModified === 'number');
