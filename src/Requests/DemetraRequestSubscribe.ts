import DemetraRequest from "./DemetraRequest";
import { DemetraRequestSubscribeOptions, WP_MODES } from "../declarations";

class DemetraRequestSubscribe extends DemetraRequest {
  public email : string = '';

  constructor(options : DemetraRequestSubscribeOptions) {
    super(WP_MODES.SUBSCRIBE, -1, '', options.site, options.version);
    this.email = options.email;
  }
}

export default DemetraRequestSubscribe;
