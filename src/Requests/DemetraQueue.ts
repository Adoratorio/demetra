import DemetraRequestArchive from "./DemetraRequestArchive";
import DemetraRequestExtra from "./DemetraRequestExtra";
import DemetraRequestMenu from "./DemetraRequestMenu";
import DemetraRequestPage from "./DemetraRequestPage";
import DemetraRequestTaxonomy from "./DemetraRequestTaxonomy";

class DemetraQueue {
  public readonly requests : Array<
    DemetraRequestPage |
    DemetraRequestArchive |
    DemetraRequestExtra |
    DemetraRequestTaxonomy
  > = [];

  constructor() {}

  add(request : DemetraRequestPage | DemetraRequestArchive | DemetraRequestExtra | DemetraRequestMenu | DemetraRequestTaxonomy) {
    this.requests.push(request);
  }

  clear() {
    this.requests.length = 0;
  }
}

export default DemetraQueue;
