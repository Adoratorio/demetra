/* eslint-disable @typescript-eslint/no-explicit-any */

export const validateUrl = (url: string): boolean => {
  const pattern = new RegExp(/^(http|https):\/\/[\w\-.]*(:[0-9]+)?\/?(api)*(\.php)*$/i);
  return pattern.test(url);
}

export const isEmpty = (value: string): boolean => value === '';

export const isUndefined = (value: unknown): boolean => typeof value === 'undefined';

export const isNull = (value: unknown): boolean => value === null;

export const isBoolean = (value: unknown): boolean => typeof value === 'boolean';

export const isObject = (value: unknown): boolean => value === Object(value);

export const isArray = (value: unknown): boolean => Array.isArray(value);

export const isDate = (value: unknown): boolean => value instanceof Date;

export const isBlob = (value: unknown): boolean => value instanceof Blob;

export const isFile = (value: unknown): boolean => value instanceof File;
