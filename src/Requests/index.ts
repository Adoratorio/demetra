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

export { default as DemetraQueue } from './DemetraQueue.ts';
export { default as DemetraRequest } from './DemetraRequest.ts';
export { default as DemetraRequestArchive } from './DemetraRequestArchive.ts';
export { default as DemetraRequestAttachments } from './DemetraRequestAttachments.ts';
export { default as DemetraRequestChildren } from './DemetraRequestChildren.ts';
export { default as DemetraRequestExtra } from './DemetraRequestExtra.ts';
export { default as DemetraRequestLanguages } from './DemetraRequestLanguages.ts';
export { default as DemetraRequestMenu } from './DemetraRequestMenu.ts';
export { default as DemetraRequestPage } from './DemetraRequestPage.ts';
export { default as DemetraRequestSend } from './DemetraRequestSend.ts';
export { default as DemetraRequestSiteMap } from './DemetraRequestSiteMap.ts';
export { default as DemetraRequestSubscribe } from './DemetraRequestSubscribe.ts';
export { default as DemetraRequestTaxonomy } from './DemetraRequestTaxonomy.ts';

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
