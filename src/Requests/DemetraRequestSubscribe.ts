import DemetraRequest from "./DemetraRequest";
import { WP_MODES } from "../declarations";

class DemetraRequestSubscribe extends DemetraRequest {
  public email : string = '';

  constructor(
    email : string,
    site : string,
    version? : number
  ) {
    super(WP_MODES.SUBSCRIBE, -1, '', site, version);
    this.email = email;
  }
}

export default DemetraRequestSubscribe;
