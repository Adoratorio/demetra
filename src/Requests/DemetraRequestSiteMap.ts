import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestSiteMapOptions } from '../types.ts';

class DemetraRequestSiteMap extends CacheableDemetraRequest {
  constructor(site: string, options: Partial<DemetraRequestSiteMapOptions> = {}, version?: number) {
    super(WP_MODES.SITE_MAP, -1, options, undefined, site, version);
  }
}

export default DemetraRequestSiteMap;
