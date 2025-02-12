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
  ATTACHMENTS = 'attachments',
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
  maxItems: number;
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
  taxonomy: {
    slug: string,
    id: string,
  };
}

export interface FetchMenuOptions extends Cache, Lang {}

export interface FetchExtraOptions extends Cache, Lang {}

export interface FetchTaxonomyOptions extends Cache, Lang {}

export interface FetchLanguagesOptions extends Cache, Lang {}

export interface FetchSitemapOptions extends Cache {
  filter_lang: boolean,
}

export interface FetchAttachmentsOptions extends Cache, Lang {}

export interface DemetraRequestGlobalOptions {
  id : string | number | Array<string> | Array<number>;
  mode : WP_MODES;
  site : string;
  version : number;
}

export type DemetraRequestLanguagesOptions = DemetraRequestGlobalOptions & FetchLanguagesOptions;
export type DemetraRequestSiteMapOptions = DemetraRequestGlobalOptions & FetchSitemapOptions;
export type DemetraRequestPageOptions = DemetraRequestGlobalOptions & FetchPageOptions;
export type DemetraRequestChildrenOptions = DemetraRequestGlobalOptions & FetchChildrenOptions;
export type DemetraRequestArchiveOptions = DemetraRequestGlobalOptions & FetchArchiveOptions;
export type DemetraRequestExtraOptions = DemetraRequestGlobalOptions & FetchExtraOptions;
export type DemetraRequestMenuOptions = DemetraRequestGlobalOptions & FetchMenuOptions;
export type DemetraRequestTaxonomyOptions = DemetraRequestGlobalOptions & FetchTaxonomyOptions;
export type DemetraRequestAttachmentsOptions = DemetraRequestGlobalOptions & FetchAttachmentsOptions;

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
    path : string,
  };
}>;
