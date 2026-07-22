import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestPageOptions, type Siblings } from '../types.ts';

class DemetraRequestPage extends CacheableDemetraRequest {
  public type: string;
  public i18n: boolean;
  public siblings: Siblings;

  constructor(
    id: string | number,
    options: Partial<DemetraRequestPageOptions> = {},
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(WP_MODES.PAGE, id, options, lang, site, version);

    this.type = options.type || 'page';
    this.i18n = options.i18n ?? true;
    this.siblings = options.siblings || { fields: [], prev: false, next: false, loop: false };
  }
}

export default DemetraRequestPage;
