import { LRUCache } from 'lru-cache';
import axios from 'axios';
import { validateUrl } from './validators.ts';
import {
  SEND_MODES,
  type DemetraOptions,
  type DemetraRequestLanguagesOptions,
  type DemetraRequestSiteMapOptions,
  type DemetraRequestArchiveOptions,
  type DemetraRequestExtraOptions,
  type DemetraRequestMenuOptions,
  type DemetraRequestPageOptions,
  type DemetraRequestChildrenOptions,
  type DemetraRequestTaxonomyOptions,
  type DemetraRequestAttachmentsOptions,
  type WpData,
  type WpFile,
} from './declarations.ts';
import DemetraQueue from './Requests/DemetraQueue.ts';
import DemetraRequestLanguages from './Requests/DemetraRequestLanguages.ts';
import DemetraRequestSiteMap from './Requests/DemetraRequestSiteMap.ts';
import DemetraRequestPage from './Requests/DemetraRequestPage.ts';
import DemetraRequestChildren from './Requests/DemetraRequestChildren.ts';
import DemetraRequestArchive from './Requests/DemetraRequestArchive.ts';
import DemetraRequestExtra from './Requests/DemetraRequestExtra.ts';
import DemetraRequestMenu from './Requests/DemetraRequestMenu.ts';
import DemetraRequestTaxonomy from './Requests/DemetraRequestTaxonomy.ts';
import DemetraRequestSend from './Requests/DemetraRequestSend.ts';
import DemetraRequestSubscribe from './Requests/DemetraRequestSubscribe.ts';
import DemetraRequestAttachments from './Requests/DemetraRequestAttachments.ts';

class Demetra {
  public static readonly SEND_MODES: typeof SEND_MODES = SEND_MODES;
  private readonly cache: LRUCache<string, WpData>;
  public readonly queue: DemetraQueue;
  private readonly options: DemetraOptions;

  constructor(options: Partial<DemetraOptions> = {}) {
    const defaults: DemetraOptions = {
      endpoint: '',
      uploadEndpoint: '',
      site: 'default',
      lang: 'en',
      debug: false,
      version: 2,
      cacheMaxAge: 1000 * 60 * 60,
      maxItems: 500,
      proxy: false,
    };
    this.options = { ...defaults, ...options };
    this.queue = new DemetraQueue();
    this.cache = new LRUCache({ max: this.options.maxItems, ttl: this.options.cacheMaxAge });

    if (this.options.endpoint.length <= 0 || !validateUrl(this.options.endpoint)) {
      throw new Error('Invalid endpoint');
    }

    if (this.options.uploadEndpoint.length <= 0) {
      this.options.uploadEndpoint = this.options.endpoint.replace('/api.php', '/upload.php');
    }
  }

  public async fetchQueue(sendModes: SEND_MODES = SEND_MODES.ONCE): Promise<object[]> {
    if (
      sendModes !== SEND_MODES.ONCE &&
      sendModes !== SEND_MODES.SIMULTANEOUSLY &&
      sendModes !== SEND_MODES.AWAIT
    ) {
      throw new Error('Invalid SEND_MODES');
    }

    let response = undefined;

    if (sendModes === SEND_MODES.ONCE) {
      response = this.sendOnce();
    }

    if (sendModes === SEND_MODES.SIMULTANEOUSLY) {
      response = this.sendSimultaneously();
    }

    if (sendModes === SEND_MODES.AWAIT) {
      response = this.sendConsequentially();
    }

    try {
      return (await response) || [];
    } finally {
      // Clear only after the batch settles: the sequential mode reads the
      // queue lazily, clearing upfront would drop pending requests
      this.queue.clear();
    }
  }

  public async fetchLanguages(
    site: string,
    options?: Partial<DemetraRequestLanguagesOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestLanguages(
      site,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async fetchSitemap(
    site: string,
    options?: Partial<DemetraRequestSiteMapOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestSiteMap(
      site,
      options,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async fetchPage(
    id: string | number,
    options?: Partial<DemetraRequestPageOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestPage(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async fetchChildren(
    id: number | number[] | string | string[],
    options?: Partial<DemetraRequestChildrenOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestChildren(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async fetchArchive(
    id: string,
    options?: Partial<DemetraRequestArchiveOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestArchive(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async fetchExtra(
    id: string,
    options?: Partial<DemetraRequestExtraOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestExtra(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async fetchMenu(
    id: string,
    options?: Partial<DemetraRequestMenuOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestMenu(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async fetchTaxonomy(
    id: string | string[],
    options?: Partial<DemetraRequestTaxonomyOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestTaxonomy(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async fetchAttachments(
    site: string,
    options?: Partial<DemetraRequestAttachmentsOptions>,
  ): Promise<WpData> {
    const params = new DemetraRequestAttachments(
      site,
      options,
      (options && options.version) || this.options.version,
    );
    return this.fetch(params);
  }

  public async subscribe(email: string, lang?: string, site?: string): Promise<WpData> {
    const params = new DemetraRequestSubscribe(
      email,
      null,
      lang || this.options.lang,
      site || this.options.site,
      this.options.version,
    );
    return this.fetch(params);
  }

  public async subscribeWithAdditionalData(
    email: string,
    data: Map<string, string>,
    lang?: string,
    site?: string,
  ): Promise<WpData> {
    const params = new DemetraRequestSubscribe(
      email,
      data,
      lang || this.options.lang,
      site || this.options.site,
      this.options.version,
    );
    return this.fetch(params);
  }

  public async send(id: number, recipients: string, data: object, files?: File[]): Promise<WpData> {
    const urls: { path: string; url: string }[] = [];

    if (files && files.length > 0) {
      const uploadResponses: WpFile[] = await this.upload(files);

      uploadResponses.forEach((uploadedFiles) => {
        uploadedFiles.forEach((file) => {
          if (typeof file !== 'object') {
            throw new Error('Invalid response. It must be an object');
          }
          // if (!file.hasOwnProperty('file')) { throw new Error('Invalid File Response'); }
          urls.push(file.data);
        });
      });
    }

    const params = new DemetraRequestSend(
      id,
      recipients,
      data,
      urls,
      this.options.lang,
      this.options.site,
      this.options.version,
    );
    return this.fetch(params);
  }

  private async fetch(
    params:
      | DemetraRequestLanguages
      | DemetraRequestSiteMap
      | DemetraRequestPage
      | DemetraRequestChildren
      | DemetraRequestArchive
      | DemetraRequestExtra
      | DemetraRequestMenu
      | DemetraRequestTaxonomy
      | DemetraRequestSend
      | DemetraRequestSubscribe,
  ): Promise<WpData> {
    const hasLocalCache = 'localCache' in params && params.localCache;

    // Check local cache
    if (hasLocalCache && this.cache.has(params.hash)) {
      const cached = this.cache.get(params.hash);
      if (typeof cached === 'undefined') {
        throw new Error('Unexpected empty cache entry');
      }
      return this.parseFromLocalCache(cached);
    }

    const requests = new Array();
    requests.push(params);
    const headers = {
      'Content-Type': 'application/json',
    };
    const response = await axios<WpData[]>({
      method: 'post',
      headers,
      url: this.options.endpoint,
      data: JSON.stringify({ requests }),
      responseType: 'json',
      proxy: this.options.proxy,
    });
    const json = response.data;
    json.forEach((res) => {
      this.debugLog(res);
      this.handleError(res);
    });

    const [result] = json;
    if (typeof result === 'undefined') {
      throw new Error('Empty response from API');
    }

    if (hasLocalCache) {
      this.cache.set(params.hash, result);
    }
    return result;
  }

  public async upload(files: File[] | File): Promise<WpFile[]> {
    if (typeof this.options.uploadEndpoint === 'undefined') {
      throw new Error('No upload endpoint defined');
    }
    files = Array.isArray(files) ? files : [files];

    const responses: Promise<Response>[] = files.map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      const request = new Request(this.options.uploadEndpoint, { method: 'POST', body: formData });
      return fetch(request);
    });
    const promisesResponses = await Promise.all(responses);
    const jsons: Promise<WpFile>[] = promisesResponses.map((response) => response.json());
    return Promise.all(jsons);
  }

  private async sendOnce(): Promise<object[]> {
    // This will contains the already fetched data extrapolated from the local cache and the original array index
    const cachedDates: { index: number; data: WpData }[] = [];
    // This will contain all un-cacheable and all the uncached requests
    const uncachedRequests: (
      | DemetraRequestLanguages
      | DemetraRequestSiteMap
      | DemetraRequestPage
      | DemetraRequestChildren
      | DemetraRequestArchive
      | DemetraRequestExtra
      | DemetraRequestTaxonomy
    )[] = [];

    this.queue.requests.forEach((request, index) => {
      if (request.localCache && this.cache.has(request.hash)) {
        const cached = this.cache.get(request.hash);
        if (typeof cached === 'undefined') {
          throw new Error('Unexpected empty cache entry');
        }
        cachedDates.push({ index, data: this.parseFromLocalCache(cached) });
      } else {
        uncachedRequests.push(request);
      }
    });

    // Inject endpoint and all configuration taken from demetra instance options
    const headers = {
      'Content-Type': 'application/json',
    };
    const response = await axios<WpData[]>({
      method: 'post',
      headers,
      url: this.options.endpoint,
      data: JSON.stringify({ requests: uncachedRequests }),
      responseType: 'json',
      proxy: this.options.proxy,
    });
    const responses = response.data;
    uncachedRequests.forEach((request, index) => {
      if (request.localCache) {
        this.cache.set(request.hash, responses[index]);
      }
    });

    // Merge cached data with fetch data in the original index
    cachedDates.forEach((cachedData) => {
      responses.splice(cachedData.index, 0, cachedData.data);
    });

    responses.forEach((res) => {
      this.debugLog(res);
      this.handleError(res);
    });

    return responses;
  }

  private async sendSimultaneously(): Promise<WpData[]> {
    const promises: Promise<WpData>[] = this.queue.requests.map((request) => this.fetch(request));
    return Promise.all(promises);
  }

  private async sendConsequentially(): Promise<WpData[]> {
    // SEND_MODES.AWAIT: requests must resolve one after the other
    const requests = [...this.queue.requests];
    const responses: WpData[] = [];
    for (const request of requests) {
      responses.push(await this.fetch(request));
    }
    return responses;
  }

  private debugLog(response: WpData) {
    if (this.options.debug) {
      console.log(response);
    }
  }

  private handleError(response: WpData) {
    if (response.status.code === 500) {
      if (!this.options.debug) {
        console.warn(`${response.status.code} - ${response.status.message}`);
      } else {
        throw new Error(`${response.status.code} - ${response.status.message}`);
      }
    }
  }

  private parseFromLocalCache(cached: WpData) {
    cached.status.code = 304;
    cached.status.message = 'Data loaded from local cache';
    cached.status.cache = true;
    return cached;
  }

  // Getters and setters

  public get endpoint(): string {
    return this.options.endpoint;
  }

  public set endpoint(url: string) {
    this.options.endpoint = url;
  }

  public get uploadEndpoint(): string {
    return this.options.uploadEndpoint;
  }

  public set uploadEndpoint(url: string) {
    this.options.uploadEndpoint = url;
  }

  public get lang(): string {
    return this.options.lang;
  }

  public set lang(lang: string) {
    this.options.lang = lang;
  }
}

export default Demetra;
export {
  DemetraRequestPage,
  DemetraRequestChildren,
  DemetraRequestArchive,
  DemetraRequestMenu,
  DemetraRequestExtra,
  DemetraRequestTaxonomy,
  DemetraRequestSiteMap,
  DemetraRequestLanguages,
  DemetraRequestAttachments,
};
