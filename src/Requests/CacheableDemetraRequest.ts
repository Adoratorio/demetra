import DemetraRequest from './DemetraRequest.ts';
import {
  type Cache,
  type DemetraRequestBaseOptions,
  type RequestId,
  type WP_MODES,
} from '../types.ts';

export type CacheableDemetraRequestOptions = DemetraRequestBaseOptions & Partial<Cache>;

// Base for every request that supports server- and client-side caching.
// Concrete requests without caching (send, subscribe) extend DemetraRequest directly.
class CacheableDemetraRequest extends DemetraRequest {
  public wpCache: boolean;
  public localCache: boolean;

  constructor(mode: WP_MODES, id: RequestId, options: CacheableDemetraRequestOptions = {}) {
    super(mode, id, options);

    this.wpCache = options.wpCache ?? true;
    this.localCache = options.localCache ?? false;
  }
}

export default CacheableDemetraRequest;
