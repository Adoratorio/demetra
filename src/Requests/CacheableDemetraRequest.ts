import DemetraRequest from './DemetraRequest.ts';
import { type Cache, type WP_MODES } from '../types.ts';

// Base for every request that supports server- and client-side caching.
// Concrete requests without caching (send, subscribe) extend DemetraRequest directly.
class CacheableDemetraRequest extends DemetraRequest {
  public wpCache: boolean;
  public localCache: boolean;

  constructor(
    mode: WP_MODES,
    id: string | number | string[] | number[],
    options: Partial<Cache> = {},
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(mode, id, lang, site, version);

    this.wpCache = options.wpCache ?? true;
    this.localCache = options.localCache ?? false;
  }
}

export default CacheableDemetraRequest;
