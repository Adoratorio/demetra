import DemetraRequest from "./DemetraRequest";
import { DemetraRequestChildrenOptions, WP_MODES } from "../declarations";

class DemetraRequestChildren extends DemetraRequest {
  public i18n: boolean;
  public wpCache: boolean;
  public localCache: boolean;

  constructor(
    id: number | Array<number> | string | Array<string>,
    options?: Partial<DemetraRequestChildrenOptions>,
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(WP_MODES.CHILDREN, id, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.i18n = options.i18n              || true;
    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestChildren;
