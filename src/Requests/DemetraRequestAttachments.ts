import DemetraRequest from "./DemetraRequest";
import { DemetraRequestAttachmentsOptions, WP_MODES } from "../declarations";

class DemetraRequestAttachments extends DemetraRequest {
  public wpCache : boolean;
  public localCache : boolean;

  constructor(
    site : string,
    options? : Partial<DemetraRequestAttachmentsOptions>,
    version? : number,
  ) {
    super(WP_MODES.ATTACHMENTS, -1, undefined, site, version);

    if (typeof options === 'undefined') options = {};

    this.wpCache = typeof options.wpCache === 'undefined' ? true : options.wpCache;
    this.localCache = typeof options.localCache === 'undefined' ? false : options.localCache;
  }
}

export default DemetraRequestAttachments;
