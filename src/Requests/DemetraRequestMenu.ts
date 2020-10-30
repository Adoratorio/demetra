import DemetraRequest from "./DemetraRequest";
import { DemetraRequestMenuOptions, WP_MODES } from "../declarations";

class DemetraRequestMenu extends DemetraRequest {
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    id : string | number,
    options? : Partial<DemetraRequestMenuOptions>,
    lang? : string,
    site? : string,
    version? : number,
  ) {
    super(WP_MODES.MENU, id, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = options.wpCache        || true;
    this.localCache = options.localCache  || false;
  }
}

export default DemetraRequestMenu;
