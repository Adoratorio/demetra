import DemetraRequest from './DemetraRequest.ts';
import { WP_MODES } from '../types.ts';

class DemetraRequestSubscribe extends DemetraRequest {
  public email = '';
  // Stored as a plain object (not a Map): the request is serialized with
  // JSON.stringify, and a Map serializes to `{}` — which silently dropped all
  // additional subscribe data. Object.fromEntries preserves it.
  public data: Record<string, string> = {};

  constructor(
    email: string,
    data: null | Map<string, string>,
    lang: string,
    site: string,
    version?: number,
  ) {
    super(WP_MODES.SUBSCRIBE, -1, lang, site, version);
    this.email = email;
    this.data = data ? Object.fromEntries(data) : {};
  }
}

export default DemetraRequestSubscribe;
