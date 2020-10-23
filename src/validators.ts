/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types */

export function validateUrl(url: string) {
  const pattern = new RegExp(
    /^(http|https):\/\/[\w\-.]*(:[0-9]+)?\/?(api)*(\.php)*$/i
  );
  return pattern.test(url);
}

export const isUndefined = (value: unknown): boolean =>
  typeof value === 'undefined';

export const isNull = (value: unknown): boolean => value === null;

export const isEmpty = (value: unknown) =>
  typeof value === 'string' && value === '';

export const isBoolean = (value: unknown) => typeof value === "boolean";

export const isObject = (value: unknown) => value === Object(value);

export const isArray = (value: unknown) => Array.isArray(value);

export const isDate = (value: unknown) => value instanceof Date;

export const isBlob = (value: unknown) =>
  value instanceof Blob
  // typeof value.size === 'number' &&
  // typeof value.type === 'string' &&
  // typeof value.slice === 'function';

export const isFile = (value: unknown) =>
  value instanceof File
  // isBlob(value) &&
  // typeof value.name === "string" &&
  // (typeof value.lastModifiedDate === "object" ||
  //   typeof value.lastModified === "number");
