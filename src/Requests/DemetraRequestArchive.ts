import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import {
  WP_MODES,
  type DemetraRequestArchiveOptions,
  type Pagination,
  type Filter,
} from '../types.ts';

class DemetraRequestArchive extends CacheableDemetraRequest {
  public i18n: boolean;
  public fields: string[];
  public pagination: Pagination;
  public filters: Filter[];

  constructor(
    id: string | number,
    options: Partial<DemetraRequestArchiveOptions> = {},
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(WP_MODES.ARCHIVE, id, options, lang, site, version);

    this.i18n = options.i18n ?? true;
    this.fields = options.fields || [];
    this.pagination = options.pagination || { start: 0, count: -1 };
    this.filters = options.filters || [];
  }
}

export default DemetraRequestArchive;
