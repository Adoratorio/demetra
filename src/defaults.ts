import {
  FetchPageOptions,
  FetchArchiveOptions,
  FetchExtraOptions,
  FetchMenuOptions,
  FetchTaxonomyOptions,
  FetchSendOptions,
  Cache,
  Lang,
  DemetraOptions,
} from './declarations';

const cache: Cache = {
  wpCache: false,
  localCache: false,
};

const lang: Lang = {
  lang: 'en',
  i18n: true,
};

const page: FetchPageOptions = {
  type: 'page',
  siblings: {
    fields: [],
    prev: false,
    next: false,
    loop: false,
  },
  fields: [],
  ...cache,
  ...lang,
};

const archive: FetchArchiveOptions = {
  fields: [],
  filters: [],
  ...cache,
  ...lang,
};

const extra: FetchExtraOptions = {
  ...cache,
  ...lang,
};

const menu: FetchMenuOptions = {
  ...cache,
  ...lang,
};

const taxonomy: FetchTaxonomyOptions = {
  ...cache,
  ...lang,
};

/*
 * global modes
 */
// eslint-disable-next-line no-shadow
export enum WP_MODES {
  PAGE = 'page',
  ARCHIVE = 'archive',
  EXTRA = 'extra',
  MENU = 'menu',
  TAXONOMY = 'taxonomy',
  SEND = 'send',
  SUBSCRIBE = 'subscribe',
}

// eslint-disable-next-line no-shadow
export enum SEND_MODES {
  'ONCE',
  'SIMULTANEOUSLY',
  'AWAIT',
}

export const FETCH_OPTIONS = new Map();
FETCH_OPTIONS.set(WP_MODES.PAGE, page);
FETCH_OPTIONS.set(WP_MODES.ARCHIVE, archive);
FETCH_OPTIONS.set(WP_MODES.EXTRA, extra);
FETCH_OPTIONS.set(WP_MODES.MENU, menu);
FETCH_OPTIONS.set(WP_MODES.TAXONOMY, taxonomy);
// OPTIONS.set('send', send);

export const DEMETRA_OPTIONS: DemetraOptions = {
  endpoint: '',
  uploadEndpoint: '',
  site: 'default',
  lang: 'en',
  debug: false,
  cacheMaxAge: 1000 * 60 * 60,
};
