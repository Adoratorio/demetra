import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestChildrenOptions, type RequestId } from '../types.ts';

class DemetraRequestChildren extends CacheableDemetraRequest {
  public i18n: boolean;

  constructor(id: RequestId, options: Partial<DemetraRequestChildrenOptions> = {}) {
    super(WP_MODES.CHILDREN, id, options);

    this.i18n = options.i18n ?? true;
  }
}

export default DemetraRequestChildren;
