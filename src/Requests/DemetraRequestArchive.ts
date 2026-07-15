import DemetraRequest from './DemetraRequest.ts';
import {
  WP_MODES,
  type DemetraRequestArchiveOptions,
  type Pagination,
  type Filter,
} from '../declarations.ts';

class DemetraRequestArchive extends DemetraRequest {
  public i18n: boolean;
  public fields: string[];
  public pagination: Pagination;
  public filters: Filter[];
  public wpCache: boolean;
  public localCache: boolean;

  constructor(
    id: string | number,
    options?: Partial<DemetraRequestArchiveOptions>,
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(WP_MODES.ARCHIVE, id, lang, site, version);

    if (typeof options === 'undefined') {
      options = {};
    }

    this.i18n = options.i18n ?? true;
    this.fields = options.fields || [];
    this.pagination = options.pagination || { start: 0, count: -1 };
    this.filters = options.filters || [];
    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestArchive;
