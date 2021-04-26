import DemetraRequest from "./DemetraRequest";
import { DemetraRequestPageOptions, Siblings, WP_MODES } from "../declarations";

class DemetraRequestPage extends DemetraRequest {
  public type : string;
  public i18n : boolean;
  public siblings : Siblings;
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    id : string | number,
    options? : Partial<DemetraRequestPageOptions>,
    lang? : string,
    site? : string,
    version? : number,
  ) {
    super(WP_MODES.PAGE, id, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.type = options.type              || 'page';
    this.i18n = options.i18n              || true;
    this.siblings = options.siblings      || { fields: [], prev: false, next: false, loop: false };
    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestPage;
