// @ts-ignore
import { Options as LRUOptions } from 'lru-cache';
export interface DemetraOptions {
  endpoint : string,
  uploadEndpoint : string,
  site : string,
  lang : string,
  debug : boolean,
  cacheMaxAge: number
}

export interface DemetraRequestOptions {
  id: string | number,
  mode: string,
  wpCache : boolean,
  localCache : boolean,
  lang? : string,
  type? : string,
  i18n?: boolean,
  siblings? : Siblings,
  fields? : Array<string>,
  filters? : Array<Filter>,
  pagination? : Pagination,
  recipients? : string,
  attachments? : Array<string>
}

export interface Pagination {
  start : number ,
  count : number,
}

export interface Filter {
  compare : string,
  key : string,
  value : string,
}

export interface Siblings {
  fields : Array<String>,
  next? : boolean,
  prev? : boolean,
  loop? : boolean,
}

// export interface Cache<T> {
//   readonly itemCount: number;
//
//   get(key: string, cb: (error: any, value: T) => void): void;
//   keys(): string[];
//   set(key: string, value: T, maxAge?: number): boolean;
//   reset(): void;
//   has(key: string): boolean;
//   del(key: string): void;
//   peek(key: string): T | undefined;
// }
//
// export interface Options<T> extends LRUOptions<string, T> {
//   load(key: string, callback: (error: any, asyncValue: T, maxAge?: number) => void): void;
// }
