import {
  FetchPageOptions,
  FetchArchiveOptions,
  FetchExtraOptions,
  FetchMenuOptions,
  FetchTaxonomyOptions,
  FetchSendOptions,
  Cache,
  Lang,
} from './declarations';

const cache : Cache = {
  wpCache: false,
  localCache: false,
}

const lang : Lang = {
  lang: 'en',
  i18n: true,
}

const page : FetchPageOptions = {
  type: 'page',
  siblings: {
    fields: [],
    prev: false,
    next: false,
    loop: false
  },
  fields: [],
  ...cache,
  ...lang
}

const archive : FetchArchiveOptions = {
  fields: [],
  filters: [],
  ...cache,
  ...lang
}

const extra : FetchExtraOptions = {
  ...cache,
  ...lang
}

const menu : FetchMenuOptions = {
  ...cache,
  ...lang
}

const taxonomy : FetchTaxonomyOptions = {
  ...cache,
  ...lang
}

const DEFAULTS = new Map();
DEFAULTS.set('page', page);
DEFAULTS.set('archive', archive);
DEFAULTS.set('extra', extra);
DEFAULTS.set('menu', menu);
DEFAULTS.set('taxonomy', taxonomy);
// DEFAULTS.set('send', send);


export default DEFAULTS
