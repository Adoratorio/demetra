import DemetraRequest from './DemetraRequest.ts';
import { WP_MODES, type DemetraRequestTaxonomyOptions } from '../types.ts';

class DemetraRequestTaxonomy extends DemetraRequest {
  public wpCache: boolean;
  public localCache: boolean;

  constructor(
    id: string | string[],
    options?: Partial<DemetraRequestTaxonomyOptions>,
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(WP_MODES.TAXONOMY, id, lang, site, version);

    if (typeof options === 'undefined') {
      options = {};
    }

    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestTaxonomy;
