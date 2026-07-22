import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestExtraOptions } from '../types.ts';

class DemetraRequestExtra extends CacheableDemetraRequest {
  constructor(
    id: string | number,
    options: Partial<DemetraRequestExtraOptions> = {},
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(WP_MODES.EXTRA, id, options, lang, site, version);
  }
}

export default DemetraRequestExtra;
