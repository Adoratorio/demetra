import DemetraRequest from "./DemetraRequest";
import { DemetraRequestExtraOptions, WP_MODES } from "../declarations";

class DemetraRequestExtra extends DemetraRequest {
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    id : string | number,
    options? : Partial<DemetraRequestExtraOptions>,
    lang? : string,
    site? : string,
    version? : number,
  ) {
    super(WP_MODES.EXTRA, id, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestExtra;
