import DemetraRequest from './DemetraRequest.ts';
import { WP_MODES, type FetchSendOptions } from '../types.ts';

class DemetraRequestSend extends DemetraRequest {
  public recipients: string;
  public data: object;
  public urls: { path: string; url: string }[];

  constructor(id: string | number, options: Partial<FetchSendOptions> = {}) {
    super(WP_MODES.SEND, id, options);

    this.recipients = options.recipients || '';
    this.data = options.data || {};
    this.urls = options.urls || [];
  }
}

export default DemetraRequestSend;
