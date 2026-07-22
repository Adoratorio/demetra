import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestMenuOptions } from '../types.ts';

class DemetraRequestMenu extends CacheableDemetraRequest {
  constructor(
    id: string | number,
    options: Partial<DemetraRequestMenuOptions> = {},
    lang?: string,
    site?: string,
    version?: number,
  ) {
    super(WP_MODES.MENU, id, options, lang, site, version);
  }
}

export default DemetraRequestMenu;
