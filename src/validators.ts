export function validateUrl(url : string) {
  const pattern = new RegExp(/^(http|https):\/\/[\w\-\.]*(:[0-9]+)?\/?(api)*(\.php)*$/i);
  return pattern.test(url);
}

export const isUndefined = (value : any) : boolean => typeof value === 'undefined';

export const isNull = (value : any) : boolean => value === null;

export const isEmpty = (value : any) : boolean => typeof value === 'string' && value === '';

export const isBoolean = (value : any) : boolean => typeof value === 'boolean';

export const isObject = (value : any) : boolean => value === Object(value);

export const isArray = (value : any) : boolean => Array.isArray(value);

export const isDate = (value : any) : boolean => value instanceof Date;

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
