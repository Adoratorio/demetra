import DemetraRequest from "./DemetraRequest";
import { DemetraRequestLanguagesOptions, WP_MODES } from '../declarations';

class DemetraRequestLanguages extends DemetraRequest {
  public wpCache: boolean;
  public localCache: boolean;

  constructor(
    site: string,
    options?: Partial<DemetraRequestLanguagesOptions>,
    lang?: string,
    version?: number,
  ) {
    super(WP_MODES.LANGUAGES, -1, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestLanguages;
