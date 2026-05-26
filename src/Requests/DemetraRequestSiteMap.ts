import DemetraRequest from './DemetraRequest.ts';
import { WP_MODES, type DemetraRequestSiteMapOptions } from '../declarations.ts';

class DemetraRequestSiteMap extends DemetraRequest {
  public wpCache: boolean;
  public localCache: boolean;

  constructor(site: string, options?: Partial<DemetraRequestSiteMapOptions>, version?: number) {
    super(WP_MODES.SITE_MAP, -1, undefined, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestSiteMap;
