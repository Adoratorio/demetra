import DemetraRequest from "./DemetraRequest";
import { WP_MODES } from "../declarations";

class DemetraRequestSubscribe extends DemetraRequest {
  public email : string = '';

  constructor(
    email : string,
    site : string,
    lang : string,
    version? : number
  ) {
    super(WP_MODES.SUBSCRIBE, -1, site, lang, version);
    this.email = email;
  }
}

export default DemetraRequestSubscribe;
