import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import {
  WP_MODES,
  type DemetraRequestArchiveOptions,
  type Filter,
  type Pagination,
  type Taxonomy,
} from '../types.ts';

class DemetraRequestArchive extends CacheableDemetraRequest {
  public i18n: boolean;
  public fields: string[];
  public pagination: Pagination;
  public filters: Filter[];
  // Sent only when provided
  public taxonomy: Taxonomy | undefined;

  constructor(id: string | number, options: Partial<DemetraRequestArchiveOptions> = {}) {
    super(WP_MODES.ARCHIVE, id, options);

    this.i18n = options.i18n ?? true;
    this.fields = options.fields || [];
    this.pagination = options.pagination || { start: 0, count: -1 };
    this.filters = options.filters || [];
    this.taxonomy = options.taxonomy;
  }
}

export default DemetraRequestArchive;
