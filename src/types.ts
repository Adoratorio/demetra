export type RequestId = string | number | string[] | number[];

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
  fields: string[];
  next?: boolean;
  prev?: boolean;
  loop?: boolean;
}

export interface Taxonomy {
  slug: string;
  id: string;
}

export interface Cache {
  wpCache: boolean;
  localCache: boolean;
}

export interface Lang {
  lang: string;
  i18n: boolean;
}

export const WP_MODES = {
  LANGUAGES: 'languages',
  SITE_MAP: 'sitemap',
  PAGE: 'page',
  CHILDREN: 'children',
  ARCHIVE: 'archive',
  EXTRA: 'extra',
  MENU: 'menu',
  TAXONOMY: 'taxonomy',
  SEND: 'send',
  SUBSCRIBE: 'subscribe',
  ATTACHMENTS: 'attachments',
} as const;

export type WP_MODES = (typeof WP_MODES)[keyof typeof WP_MODES];

export const SEND_MODES = {
  ONCE: 0,
  SIMULTANEOUSLY: 1,
  AWAIT: 2,
} as const;

export type SEND_MODES = (typeof SEND_MODES)[keyof typeof SEND_MODES];

// Everything `fetch` accepts except what Demetra sets itself
export type DemetraFetchOptions = Omit<RequestInit, 'method' | 'body'>;

export interface DemetraOptions {
  endpoint: string;
  uploadEndpoint: string;
  site: string;
  lang: string;
  version: number;
  debug: boolean;
  // Reject with a `DemetraError` when the API answers with a status code >= 400
  throwOnError: boolean;
  // Abort requests after this many ms (0 disables)
  timeout: number;
  fetchOptions: DemetraFetchOptions;
  cacheMaxAge: number;
  maxItems: number;
}

// Fields every request can set; the ones left out are filled in by the
// Demetra instance defaults when the request is sent
export interface DemetraRequestBaseOptions {
  lang?: string;
  site?: string;
  version?: number;
}

export interface FetchPageOptions extends Cache, Lang {
  type: string;
  siblings: Siblings;
}

export interface FetchChildrenOptions extends Cache, Lang {}

export interface FetchArchiveOptions extends Cache, Lang {
  fields: string[];
  pagination: Pagination;
  filters: Filter[];
  taxonomy: Taxonomy;
}

export interface FetchMenuOptions extends Cache, Lang {}

export interface FetchExtraOptions extends Cache, Lang {}

export interface FetchTaxonomyOptions extends Cache, Lang {}

export interface FetchLanguagesOptions extends Cache, Lang {}

export interface FetchSitemapOptions extends Cache {
  filter_lang: boolean;
}

export interface FetchAttachmentsOptions extends Cache, Lang {}

export interface FetchSendOptions extends DemetraRequestBaseOptions {
  recipients: string;
  data: object;
  urls: { path: string; url: string }[];
}

export interface FetchSubscribeOptions extends DemetraRequestBaseOptions {
  data: Map<string, string> | Record<string, string> | null;
}

export interface DemetraRequestGlobalOptions {
  id: RequestId;
  mode: WP_MODES;
  site: string;
  version: number;
}

export type DemetraRequestLanguagesOptions = DemetraRequestGlobalOptions & FetchLanguagesOptions;
export type DemetraRequestSiteMapOptions = DemetraRequestGlobalOptions & FetchSitemapOptions;
export type DemetraRequestPageOptions = DemetraRequestGlobalOptions & FetchPageOptions;
export type DemetraRequestChildrenOptions = DemetraRequestGlobalOptions & FetchChildrenOptions;
export type DemetraRequestArchiveOptions = DemetraRequestGlobalOptions & FetchArchiveOptions;
export type DemetraRequestExtraOptions = DemetraRequestGlobalOptions & FetchExtraOptions;
export type DemetraRequestMenuOptions = DemetraRequestGlobalOptions & FetchMenuOptions;
export type DemetraRequestTaxonomyOptions = DemetraRequestGlobalOptions & FetchTaxonomyOptions;
export type DemetraRequestAttachmentsOptions = DemetraRequestGlobalOptions &
  FetchAttachmentsOptions;

export interface WpData<T = unknown> {
  status: {
    code: number;
    message: string;
    cache: boolean;
  };
  data: T;
}

export interface WpFile {
  status: {
    code: number;
    message: string;
  };
  data: {
    uploadId: number;
    url: string;
    path: string;
  };
}
