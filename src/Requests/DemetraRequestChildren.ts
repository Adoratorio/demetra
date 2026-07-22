import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestChildrenOptions } from '../types.ts';

class DemetraRequestChildren extends CacheableDemetraRequest {
  public i18n: boolean;

  constructor(
    id: number | number[] | string | string[],
    options: Partial<DemetraRequestChildrenOptions> = {},
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(WP_MODES.CHILDREN, id, options, lang, site, version);

    this.i18n = options.i18n ?? true;
  }
}

export default DemetraRequestChildren;
