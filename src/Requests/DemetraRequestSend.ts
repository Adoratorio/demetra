import DemetraRequest from "./DemetraRequest";
import { DemetraRequestSendOptions, WP_MODES } from "../declarations";

class DemetraRequestSend extends DemetraRequest {
  public recipients : string = '';
  public data : object = {};
  public urls : Array<string> = [];

  constructor(options : DemetraRequestSendOptions) {
    super(WP_MODES.SEND, options.id, '', options.site, options.version);
    this.recipients = options.recipients;
    this.data = options.data;
    this.urls = options.urls;
  }
}

export default DemetraRequestSend;
