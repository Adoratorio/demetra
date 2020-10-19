import DemetraRequest from './DemetraRequest';

const DEFAULTS = new Map();

DEFAULTS.set('cache', {
  wpCache: false,
  localCache: false
});

DEFAULTS.set('page', {
  i18n: true,
  siblings: {
    fields: [],
    prev: false,
    next: false,
    loop: false
  },
  fields: [],
});

DEFAULTS.set('archive', {
  fields: [],
  filters: [],
});

DEFAULTS.set('menu', {
});

DEFAULTS.set('extra', {
});

DEFAULTS.set('taxonomy', {
});

export default DEFAULTS
