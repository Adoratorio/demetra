import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestLanguagesOptions } from '../types.ts';

class DemetraRequestLanguages extends CacheableDemetraRequest {
  constructor(site: string, options: Partial<DemetraRequestLanguagesOptions> = {}) {
    super(WP_MODES.LANGUAGES, -1, { ...options, site });
  }
}

export default DemetraRequestLanguages;
