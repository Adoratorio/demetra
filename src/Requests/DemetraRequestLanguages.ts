import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestLanguagesOptions } from '../types.ts';

class DemetraRequestLanguages extends CacheableDemetraRequest {
  constructor(
    site: string,
    options: Partial<DemetraRequestLanguagesOptions> = {},
    lang?: string,
    version?: number,
  ) {
    super(WP_MODES.LANGUAGES, -1, options, lang, site, version);
  }
}

export default DemetraRequestLanguages;
