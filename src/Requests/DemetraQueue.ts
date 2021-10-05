import DemetraRequestArchive from "./DemetraRequestArchive";
import DemetraRequestExtra from "./DemetraRequestExtra";
import DemetraRequestMenu from "./DemetraRequestMenu";
import DemetraRequestPage from "./DemetraRequestPage";
import DemetraRequestTaxonomy from "./DemetraRequestTaxonomy";
import DemetraRequestLanguages from './DemetraRequestLanguages';
import DemetraRequestSitemap from './DemetraRequestSitemap';
import DemetraRequestChildren from './DemetraRequestChildren';

class DemetraQueue {
  public readonly requests : Array<
    DemetraRequestPage |
    DemetraRequestArchive |
    DemetraRequestExtra |
    DemetraRequestTaxonomy |
    DemetraRequestLanguages |
    DemetraRequestSitemap |
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
        DemetraRequestSitemap |
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
