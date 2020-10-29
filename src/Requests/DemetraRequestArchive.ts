import DemetraRequest from "./DemetraRequest";
import {
  DemetraRequestArchiveOptions,
  Pagination,
  Filter,
  WP_MODES,
} from "../declarations";

class DemetraRequestArchive extends DemetraRequest {
  public i18n : boolean;
  public fields : Array<string>;
  public pagination : Pagination;
  public filters : Array<Filter>;
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    id : string | number,
    options? : Partial<DemetraRequestArchiveOptions>,
    lang? : string,
    site? : string,
    version? : number
  ) {
    super(WP_MODES.ARCHIVE, id, lang, site, version);

    if (typeof options === 'undefined') options = {};

    this.i18n = options.i18n              || true;
    this.fields = options.fields          || [];
    this.pagination = options.pagination  || { start: 0, count: -1 };
    this.filters = options.filters        || [];
    this.wpCache = options.wpCache        || true;
    this.localCache = options.localCache  || false;
  }
}

export default DemetraRequestArchive;
