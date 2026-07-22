import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestAttachmentsOptions } from '../types.ts';

class DemetraRequestAttachments extends CacheableDemetraRequest {
  constructor(
    site: string,
    options: Partial<DemetraRequestAttachmentsOptions> = {},
    version?: number,
  ) {
    super(WP_MODES.ATTACHMENTS, -1, options, undefined, site, version);
  }
}

export default DemetraRequestAttachments;
