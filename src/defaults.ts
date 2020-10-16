const DEFAULTS = new Map();

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

DEFAULTS.set('menu', {
});

DEFAULTS.set('archive', {
  fields: [],
  filters: [],
});

DEFAULTS.set('extra', {
});

DEFAULTS.set('taxonomy', {
});

export default DEFAULTS
