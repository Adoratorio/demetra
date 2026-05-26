import DemetraRequest from './DemetraRequest.ts';
import { WP_MODES } from '../declarations.ts';

class DemetraRequestSubscribe extends DemetraRequest {
  public email = '';
  public data = new Map<string, string>();

  constructor(
    email: string,
    data: null | Map<string, string>,
    lang: string,
    site: string,
    version?: number,
  ) {
    super(WP_MODES.SUBSCRIBE, -1, lang, site, version);
    this.email = email;
    this.data = data || new Map();
  }
}

export default DemetraRequestSubscribe;
