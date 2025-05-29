import DemetraRequest from "./DemetraRequest";
import { WP_MODES } from "../declarations";

class DemetraRequestSubscribe extends DemetraRequest {
  public email: string = '';
  public data: Map<string, string> = new Map();

  constructor(
    email: string,
    data: null | Map<string, string>,
    lang: string,
    site: string,
    version?: number
  ) {
    super(WP_MODES.SUBSCRIBE, -1, lang, site, version);
    this.email = email;
    this.data = data || new Map();
  }
}

export default DemetraRequestSubscribe;
