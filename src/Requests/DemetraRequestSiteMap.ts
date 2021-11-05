import DemetraRequest from "./DemetraRequest";
import { DemetraRequestSitemapOptions, WP_MODES } from '../declarations';

class DemetraRequestSitemap extends DemetraRequest {
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    site : string,
    options? : Partial<DemetraRequestSitemapOptions>,
    version? : number,
    ) {
    super(WP_MODES.SITE_MAP, undefined, undefined, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestSitemap;
