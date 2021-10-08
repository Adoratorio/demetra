import DemetraRequest from "./DemetraRequest";
import { DemetraRequestAlternatesOptions, WP_MODES } from '../declarations';

class DemetraRequestAlternates extends DemetraRequest {
  public type : string;
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    id : string | number,
    options? : Partial<DemetraRequestAlternatesOptions>,
    site? : string,
    lang? : string,
    version? : number,
    ) {
    super(WP_MODES.ALTERNATES, id, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.type = options.type              || 'page';
    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestAlternates;
