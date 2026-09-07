import type DemetraRequestArchive from './DemetraRequestArchive.ts';
import type DemetraRequestAttachments from './DemetraRequestAttachments.ts';
import type DemetraRequestChildren from './DemetraRequestChildren.ts';
import type DemetraRequestExtra from './DemetraRequestExtra.ts';
import type DemetraRequestLanguages from './DemetraRequestLanguages.ts';
import type DemetraRequestMenu from './DemetraRequestMenu.ts';
import type DemetraRequestPage from './DemetraRequestPage.ts';
import type DemetraRequestSend from './DemetraRequestSend.ts';
import type DemetraRequestSiteMap from './DemetraRequestSiteMap.ts';
import type DemetraRequestSubscribe from './DemetraRequestSubscribe.ts';
import type DemetraRequestTaxonomy from './DemetraRequestTaxonomy.ts';

// A clean union type reused across requests and the queue
export type AnyDemetraRequest =
  | DemetraRequestPage
  | DemetraRequestArchive
  | DemetraRequestExtra
  | DemetraRequestTaxonomy
  | DemetraRequestLanguages
  | DemetraRequestSiteMap
  | DemetraRequestChildren
  | DemetraRequestMenu
  | DemetraRequestAttachments
  | DemetraRequestSend
  | DemetraRequestSubscribe;
