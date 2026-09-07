import DemetraRequest from './DemetraRequest.ts';
import { WP_MODES, type FetchSubscribeOptions } from '../types.ts';

class DemetraRequestSubscribe extends DemetraRequest {
  public email: string;
  // Stored as a plain object (not a Map): the request is serialized with
  // JSON.stringify, and a Map serializes to `{}`, silently dropping the data
  public data: Record<string, string>;

  constructor(email: string, options: Partial<FetchSubscribeOptions> = {}) {
    super(WP_MODES.SUBSCRIBE, -1, options);
    this.email = email;
    const { data } = options;
    this.data = data instanceof Map ? Object.fromEntries(data) : { ...data };
  }
}

export default DemetraRequestSubscribe;
