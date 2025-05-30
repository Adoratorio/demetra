import DemetraRequestArchive from "./DemetraRequestArchive";
import DemetraRequestExtra from "./DemetraRequestExtra";
import DemetraRequestMenu from "./DemetraRequestMenu";
import DemetraRequestPage from "./DemetraRequestPage";
import DemetraRequestTaxonomy from "./DemetraRequestTaxonomy";
import DemetraRequestLanguages from './DemetraRequestLanguages';
import DemetraRequestSiteMap from './DemetraRequestSiteMap';
import DemetraRequestChildren from './DemetraRequestChildren';

class DemetraQueue {
  public readonly requests: Array<
    DemetraRequestPage |
    DemetraRequestArchive |
    DemetraRequestExtra |
    DemetraRequestTaxonomy |
    DemetraRequestLanguages |
    DemetraRequestSiteMap |
    DemetraRequestChildren |
    DemetraRequestMenu
  > = [];

  constructor() {}

  add(request :
        DemetraRequestPage |
        DemetraRequestArchive |
        DemetraRequestExtra |
        DemetraRequestTaxonomy |
        DemetraRequestLanguages |
        DemetraRequestSiteMap |
        DemetraRequestChildren |
        DemetraRequestMenu
  ) {
    this.requests.push(request);
  }

  clear() {
    this.requests.length = 0;
  }
}

export default DemetraQueue;
