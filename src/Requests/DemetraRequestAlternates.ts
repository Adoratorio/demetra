import DemetraRequest from "./DemetraRequest";
import { DemetraRequestAlternatesOptions, WP_MODES } from '../declarations';

class DemetraRequestAlternates extends DemetraRequest {
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    site : string,
    options? : Partial<DemetraRequestAlternatesOptions>,
    lang? : string,
    version? : number,
    ) {
    super(WP_MODES.ALTERNATES, 0, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestAlternates;
