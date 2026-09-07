import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestTaxonomyOptions } from '../types.ts';

class DemetraRequestTaxonomy extends CacheableDemetraRequest {
  constructor(id: string | string[], options: Partial<DemetraRequestTaxonomyOptions> = {}) {
    super(WP_MODES.TAXONOMY, id, options);
  }
}

export default DemetraRequestTaxonomy;
