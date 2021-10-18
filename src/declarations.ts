import { AxiosProxyConfig } from "axios";

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
  LANGUAGES = 'languages',
  SITE_MAP = 'sitemap',
  PAGE = 'page',
  CHILDREN = 'children',
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
  proxy: AxiosProxyConfig | false;
}

export interface FetchPageOptions extends Cache, Lang {
  type: string;
  siblings: Siblings;
}

export interface FetchChildrenOptions extends Cache, Lang {}

export interface FetchArchiveOptions extends Cache, Lang {
  fields: Array<string>;
  pagination: Pagination;
  filters: Array<Filter>;
}

export interface FetchMenuOptions extends Cache, Lang {}

export interface FetchExtraOptions extends Cache, Lang {}

export interface FetchTaxonomyOptions extends Cache, Lang {}

export interface FetchLanguagesOptions extends Cache {}

export interface FetchSitemapOptions extends Cache {}

export interface DemetraRequestGlobalOptions {
  id : string | number | [string | number];
  mode : WP_MODES;
  site : string;
  version : number;
}

export type DemetraRequestLanguagesOptions = DemetraRequestGlobalOptions & FetchLanguagesOptions;
export type DemetraRequestSitemapOptions = DemetraRequestGlobalOptions & FetchSitemapOptions;
export type DemetraRequestPageOptions = DemetraRequestGlobalOptions & FetchPageOptions;
export type DemetraRequestChildrenOptions = DemetraRequestGlobalOptions & FetchChildrenOptions;
export type DemetraRequestArchiveOptions = DemetraRequestGlobalOptions & FetchArchiveOptions;
export type DemetraRequestExtraOptions = DemetraRequestGlobalOptions & FetchExtraOptions;
export type DemetraRequestMenuOptions = DemetraRequestGlobalOptions & FetchMenuOptions;
export type DemetraRequestTaxonomyOptions = DemetraRequestGlobalOptions & FetchTaxonomyOptions;

export type WpData = {
  status: {
    code: number;
    message: string;
    cache: boolean;
  };
  data: object;
};

export type WpFile = Array<{
  status: {
    code: number;
    message: string;
  };
  data: {
    uploadId : number,
    url : string,
  };
}>;
