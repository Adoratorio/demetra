import DemetraRequest from "./DemetraRequest";
import { DemetraRequestSiteMapOptions, WP_MODES } from '../declarations';

class DemetraRequestSiteMap extends DemetraRequest {
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    site : string,
    options? : Partial<DemetraRequestSiteMapOptions>,
    version? : number,
    ) {
    super(WP_MODES.SITE_MAP, -1, undefined, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestSiteMap;
