import DemetraRequest from "./Requests/DemetraRequest";

export interface Pagination {
  start: number;
  count: number;
}

export interface Filter {
  compare: string;
  key: string;
  value: string;
}

export interface Siblings {
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
  lang: string;
  i18n: boolean;
}

export enum WP_MODES {
  PAGE = 'page',
  ARCHIVE = 'archive',
  EXTRA = 'extra',
  MENU = 'menu',
  TAXONOMY = 'taxonomy',
  SEND = 'send',
  SUBSCRIBE = 'subscribe',
}

export enum SEND_MODES {
  'ONCE',
  'SIMULTANEOUSLY',
  'AWAIT',
}

export interface DemetraOptions {
  endpoint: string;
  uploadEndpoint: string;
  site: string;
  lang: string;
  version : number;
  debug: boolean;
  cacheMaxAge: number;
}

export interface FetchPageOptions extends Cache, Lang {
  type: string;
  siblings: Siblings;
}

export interface FetchArchiveOptions extends Cache, Lang {
  fields: Array<string>;
  pagination: Pagination;
  filters: Array<Filter>;
}

export interface FetchMenuOptions extends Cache, Lang {}

export interface FetchExtraOptions extends Cache, Lang {}

export interface FetchTaxonomyOptions extends Cache, Lang {}

export interface FetchSendOptions {
  recipients: string;
  data: Record<string, unknown>;
  urls: Array<string>;
}

export interface FetchSubscribeOptions {
  email : string;
}

export interface DemetraRequestGlobalOptions {
  id : string | number;
  mode : WP_MODES;
  site : string;
  version : number;
}

export type DemetraRequestPageOptions = DemetraRequestGlobalOptions & FetchPageOptions;
export type DemetraRequestArchiveOptions = DemetraRequestGlobalOptions & FetchArchiveOptions;
export type DemetraRequestExtraOptions = DemetraRequestGlobalOptions & FetchExtraOptions;
export type DemetraRequestMenuOptions = DemetraRequestGlobalOptions & FetchMenuOptions;
export type DemetraRequestTaxonomyOptions = DemetraRequestGlobalOptions & FetchTaxonomyOptions;
export type DemetraRequestSendOptions = DemetraRequestGlobalOptions & FetchSendOptions;
export type DemetraRequestSubscribeOptions = DemetraRequestGlobalOptions & FetchSubscribeOptions;

export type WpData = {
  status: {
    code: number;
    message: string;
    cache: boolean;
  };
  data: object;
};
