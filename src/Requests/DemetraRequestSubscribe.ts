import DemetraRequest from "./DemetraRequest";
import { DemetraRequestSubscribeOptions, WP_MODES } from "../declarations";

class DemetraRequestSubscribe extends DemetraRequest {
  public email : string = '';

  constructor(email : string, version? : number) {
    super(WP_MODES.SUBSCRIBE, -1, '', '', version);
    this.email = email;
  }
}

export default DemetraRequestSubscribe;
