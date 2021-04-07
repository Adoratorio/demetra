import DemetraRequest from "./DemetraRequest";
import { DemetraRequestTaxonomyOptions, WP_MODES } from "../declarations";

class DemetraRequestTaxonomy extends DemetraRequest {
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    id : string | Array<string>,
    options? : Partial<DemetraRequestTaxonomyOptions>,
    lang? : string,
    site? : string,
    version? : number,
  ) {
    super(WP_MODES.TAXONOMY, id, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = options.wpCache        || true;
    this.localCache = options.localCache  || false;
  }
}

export default DemetraRequestTaxonomy;
