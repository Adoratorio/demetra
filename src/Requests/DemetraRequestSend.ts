import DemetraRequest from "./DemetraRequest";
import { WP_MODES } from "../declarations";

class DemetraRequestSend extends DemetraRequest {
  public recipients: string;
  public data: object;
  public urls: Array<{ path: string, url: string }>;

  constructor(
    id: string | number,
    recipients: string,
    data: object,
    urls: Array<{ path: string, url: string }>,
    lang: string,
    site: string,
    version: number,
  ) {
    super(WP_MODES.SEND, id, lang, site, version);

    this.recipients = recipients  || '';
    this.data = data              || {};
    this.urls = urls              || [];
  }
}

export default DemetraRequestSend;
