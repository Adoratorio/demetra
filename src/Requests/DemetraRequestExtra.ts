import DemetraRequest from "./DemetraRequest";
import { DemetraRequestExtraOptions, WP_MODES } from "../declarations";

class DemetraRequestExtra extends DemetraRequest {
  public wpCache : boolean = true;
  public localCache : boolean = true;

  constructor(
    id : string | number,
    options? : Partial<DemetraRequestExtraOptions>,
    lang? : string,
    site? : string,
    version? : number,
  ) {
    super(WP_MODES.EXTRA, id, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = options.wpCache        || true;
    this.localCache = options.localCache  || false;
  }
}

export default DemetraRequestExtra;
