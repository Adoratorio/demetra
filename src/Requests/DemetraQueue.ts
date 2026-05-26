import type DemetraRequestArchive from './DemetraRequestArchive.ts';
import type DemetraRequestExtra from './DemetraRequestExtra.ts';
import type DemetraRequestMenu from './DemetraRequestMenu.ts';
import type DemetraRequestPage from './DemetraRequestPage.ts';
import type DemetraRequestTaxonomy from './DemetraRequestTaxonomy.ts';
import type DemetraRequestLanguages from './DemetraRequestLanguages.ts';
import type DemetraRequestSiteMap from './DemetraRequestSiteMap.ts';
import type DemetraRequestChildren from './DemetraRequestChildren.ts';

class DemetraQueue {
  public readonly requests: (
    | DemetraRequestPage
    | DemetraRequestArchive
    | DemetraRequestExtra
    | DemetraRequestTaxonomy
    | DemetraRequestLanguages
    | DemetraRequestSiteMap
    | DemetraRequestChildren
    | DemetraRequestMenu
  )[] = [];

  add(
    request:
      | DemetraRequestPage
      | DemetraRequestArchive
      | DemetraRequestExtra
      | DemetraRequestTaxonomy
      | DemetraRequestLanguages
      | DemetraRequestSiteMap
      | DemetraRequestChildren
      | DemetraRequestMenu,
  ) {
    this.requests.push(request);
  }

  clear() {
    this.requests.length = 0;
  }
}

export default DemetraQueue;
