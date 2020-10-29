import DemetraRequest from "./DemetraRequest";
import { DemetraRequestTaxonomyOptions, WP_MODES } from "../declarations";

class DemetraRequestTaxonomy extends DemetraRequest {
  public wpCache : boolean = true;
  public localCache : boolean = true;

  constructor(options : DemetraRequestTaxonomyOptions) {
    super(WP_MODES.TAXONOMY, options.id, options.lang, options.site, options.version);
    this.wpCache = options.wpCache;
    this.localCache = options.localCache;
  }
}

export default DemetraRequestTaxonomy;
