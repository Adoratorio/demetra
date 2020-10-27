/* eslint-disable @typescript-eslint/ban-types */

interface Pagination {
  start: number;
  count: number;
}

interface Filter {
  compare: string;
  key: string;
  value: string;
}

interface Siblings {
  fields: Array<string>;
  next?: boolean;
  prev?: boolean;
  loop?: boolean;
}

export interface Cache {
  wpCache: boolean;
  localCache: boolean;
}

export interface Lang {
  lang?: string;
  i18n?: boolean;
}

/*
 * Demetra instance options
 */
export interface DemetraOptions {
  endpoint: string;
  uploadEndpoint: string;
  site: string;
  lang: string;
  debug: boolean;
  cacheMaxAge: number;
}

/*
 * Demetra fetch options
 */
export interface FetchPageOptions extends Cache, Lang {
  type: string;
  siblings: Siblings;
  fields: Array<string>;
  filters?: Array<Filter>;
}

export interface FetchArchiveOptions extends Cache, Lang {
  fields: Array<string>;
  pagination?: Pagination;
  filters?: Array<Filter>;
}

export interface FetchExtraOptions extends Cache, Lang {}

export interface FetchMenuOptions extends Cache, Lang {}

export interface FetchTaxonomyOptions extends Cache, Lang {}

export interface FetchSendOptions {
  recipients: string;
  data: Record<string, unknown>;
  urls?: Array<string>;
  localCache?: false;
}

export interface FetchSubscribeOptions {
  localCache?: false;
}

export interface DemetraRequestGlobalOptions {
  id: string | number;
  mode: string;
}

export type FetchOptions =
  | FetchPageOptions
  | FetchArchiveOptions
  | FetchExtraOptions
  | FetchMenuOptions
  | FetchTaxonomyOptions
  | FetchSendOptions
  | FetchSubscribeOptions;

/*
 * DemetraRequest options
 */
export type DemetraRequestPageOptions = DemetraRequestGlobalOptions & FetchPageOptions;
export type DemetraRequestArchiveOptions = DemetraRequestGlobalOptions & FetchArchiveOptions;
export type DemetraRequestExtraOptions = DemetraRequestGlobalOptions & FetchExtraOptions;
export type DemetraRequestMenuOptions = DemetraRequestGlobalOptions & FetchMenuOptions;
export type DemetraRequestTaxonomyOptions = DemetraRequestGlobalOptions & FetchTaxonomyOptions;
export type DemetraRequestSendOptions = DemetraRequestGlobalOptions & FetchSendOptions;
export type DemetraRequestSubscribeOptions = DemetraRequestGlobalOptions & FetchSubscribeOptions;

export type DemetraRequestOptions =
  | DemetraRequestPageOptions
  | DemetraRequestArchiveOptions
  | DemetraRequestExtraOptions
  | DemetraRequestMenuOptions
  | DemetraRequestTaxonomyOptions
  | DemetraRequestSendOptions;

/*
 * object-to-form-data (Serialize)
 */
export interface SerializeOptions {
  indices?: boolean;
  nullsAsUndefineds?: boolean;
  booleansAsIntegers?: boolean;
  allowEmptyArrays?: boolean;
}

/*
 * JSON response
 */

export type wpData = {
  status: {
    code: number;
    message: string;
    cache: boolean;
  };
  data: object;
};
