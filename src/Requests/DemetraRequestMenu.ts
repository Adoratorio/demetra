import DemetraRequest from "./DemetraRequest";
import { DemetraRequestMenuOptions, WP_MODES } from "../declarations";

class DemetraRequestMenu extends DemetraRequest {
  public wpCache : boolean = true;
  public localCache : boolean = true;

  constructor(options : DemetraRequestMenuOptions) {
    super(WP_MODES.MENU, options.id, options.lang, options.site, options.version);
    this.wpCache = options.wpCache;
    this.localCache = options.localCache;
  }
}

export default DemetraRequestMenu;
