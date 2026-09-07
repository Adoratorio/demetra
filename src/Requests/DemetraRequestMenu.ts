import CacheableDemetraRequest from './CacheableDemetraRequest.ts';
import { WP_MODES, type DemetraRequestMenuOptions } from '../types.ts';

class DemetraRequestMenu extends CacheableDemetraRequest {
  constructor(id: string | number, options: Partial<DemetraRequestMenuOptions> = {}) {
    super(WP_MODES.MENU, id, options);
  }
}

export default DemetraRequestMenu;
