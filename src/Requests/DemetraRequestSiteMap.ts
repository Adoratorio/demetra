import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestSiteMapOptions } from '../types.ts';

class DemetraRequestSiteMap extends CacheableDemetraRequest {
  // Sent only when provided
  public filter_lang: boolean | undefined;

  constructor(site: string, options: Partial<DemetraRequestSiteMapOptions> = {}) {
    super(WP_MODES.SITE_MAP, -1, { ...options, site });
    this.filter_lang = options.filter_lang;
  }
}

export default DemetraRequestSiteMap;
