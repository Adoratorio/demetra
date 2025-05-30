import { LRUCache } from 'lru-cache';
import axios from 'axios';
import { validateUrl } from './validators';
import {
  DemetraOptions,
  DemetraRequestLanguagesOptions,
  DemetraRequestSiteMapOptions,
  DemetraRequestArchiveOptions,
  DemetraRequestExtraOptions,
  DemetraRequestMenuOptions,
  DemetraRequestPageOptions,
  DemetraRequestChildrenOptions,
  DemetraRequestTaxonomyOptions,
  DemetraRequestAttachmentsOptions,
  SEND_MODES,
  WpData,
  WpFile,
} from './declarations';
import DemetraQueue from './Requests/DemetraQueue';
import DemetraRequestLanguages from './Requests/DemetraRequestLanguages';
import DemetraRequestSiteMap from './Requests/DemetraRequestSiteMap';
import DemetraRequestPage from './Requests/DemetraRequestPage';
import DemetraRequestChildren from './Requests/DemetraRequestChildren';
import DemetraRequestArchive from './Requests/DemetraRequestArchive';
import DemetraRequestExtra from './Requests/DemetraRequestExtra';
import DemetraRequestMenu from './Requests/DemetraRequestMenu';
import DemetraRequestTaxonomy from './Requests/DemetraRequestTaxonomy';
import DemetraRequestSend from './Requests/DemetraRequestSend';
import DemetraRequestSubscribe from './Requests/DemetraRequestSubscribe';
import DemetraRequestAttachments from './Requests/DemetraRequestAttachments';

class Demetra {
  public static readonly SEND_MODES = SEND_MODES;
  private readonly cache: LRUCache<string, WpData>;
  private readonly queue: DemetraQueue;
  private options: DemetraOptions;

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
    }
    this.options = { ...defaults, ...options };
    this.queue = new DemetraQueue;
    this.cache = new LRUCache({ max: this.options.maxItems, ttl: this.options.cacheMaxAge });

    if (this.options.endpoint.length <= 0 || !validateUrl(this.options.endpoint)) {
      throw new Error('Invalid endpoint');
    }

    if (this.options.uploadEndpoint.length <= 0) {
      this.options.uploadEndpoint = this.options.endpoint.replace('/api.php', '/upload.php');
    }
  }

  public async fetchQueue(sendModes: SEND_MODES = SEND_MODES.ONCE): Promise<Array<object>> {
    if (sendModes !== SEND_MODES.ONCE && sendModes !== SEND_MODES.SIMULTANEOUSLY && sendModes !== SEND_MODES.AWAIT) {
      throw new Error('Invalid SEND_MODES')
    }

    let response;
    if (sendModes === SEND_MODES.ONCE) {
      response = this.sendOnce();
    }

    if (sendModes === SEND_MODES.SIMULTANEOUSLY) {
      response = this.sendSimultaneously();
    }

    if (sendModes === SEND_MODES.AWAIT) {
      response = this.sendConsequentially();
    }

    this.queue.clear();
    return response || [];
  }

  public async fetchLanguages(site: string, options?: Partial<DemetraRequestLanguagesOptions>): Promise<WpData> {
    const params = new DemetraRequestLanguages(
      site,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async fetchSitemap(site: string, options?: Partial<DemetraRequestSiteMapOptions>): Promise<WpData> {
    const params = new DemetraRequestSiteMap(
      site,
      options,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async fetchPage(id: string | number, options?: Partial<DemetraRequestPageOptions>): Promise<WpData> {
    const params = new DemetraRequestPage(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async fetchChildren(id: number | Array<number> | string | Array<string>, options?: Partial<DemetraRequestChildrenOptions>): Promise<WpData> {
    const params = new DemetraRequestChildren(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async fetchArchive(id: string, options?: Partial<DemetraRequestArchiveOptions>): Promise<WpData> {
    const params = new DemetraRequestArchive(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async fetchExtra(id: string, options?: Partial<DemetraRequestExtraOptions>): Promise<WpData> {
    const params = new DemetraRequestExtra(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async fetchMenu(id: string, options?: Partial<DemetraRequestMenuOptions>): Promise<WpData> {
    const params = new DemetraRequestMenu(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async fetchTaxonomy(id: string | Array<string>, options?: Partial<DemetraRequestTaxonomyOptions>): Promise<WpData> {
    const params = new DemetraRequestTaxonomy(
      id,
      options,
      (options && options.lang) || this.options.lang,
      (options && options.site) || this.options.site,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async fetchAttachments(site: string, options?: Partial<DemetraRequestAttachmentsOptions>): Promise<WpData> {
    const params = new DemetraRequestAttachments(
      site,
      options,
      (options && options.version) || this.options.version
    );
    return this.fetch(params);
  }

  public async subscribe(email: string, lang?: string, site?: string): Promise<WpData> {
    const params = new DemetraRequestSubscribe(
      email,
      null,
      lang || this.options.lang,
      site || this.options.site,
      this.options.version
    );
    return this.fetch(params);
  }

  public async subscribeWithAdditionalData(email: string, data: Map<string, string>, lang?: string, site?: string): Promise<WpData> {
    const params = new DemetraRequestSubscribe(
      email,
      data,
      lang || this.options.lang,
      site || this.options.site,
      this.options.version
    );
    return this.fetch(params);
  }

  public async send(id: number, recipients: string, data: object, files?: Array<File>): Promise<WpData> {
    let urls: Array<{ path: string, url: string }> = [];

    if (files && files.length > 0) {
      const uploadResponses: Array<WpFile> = await this.upload(files);

      uploadResponses.forEach((files) => {
        files.forEach((file) => {
          if (typeof file !== 'object') {
            throw new Error('Invalid response. It mus be an object');
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
      this.options.version
    );
    return this.fetch(params);
  }

  private async fetch(
    params: DemetraRequestLanguages |
            DemetraRequestSiteMap |
            DemetraRequestPage |
            DemetraRequestChildren |
            DemetraRequestArchive |
            DemetraRequestExtra |
            DemetraRequestMenu |
            DemetraRequestTaxonomy |
            DemetraRequestSend |
            DemetraRequestSubscribe
  ): Promise<WpData> {
    // Check local cache
    if ((params as any).localCache && this.cache.has(params.hash)) {
      const cached = this.cache.get(params.hash) || {} as WpData;
      if (typeof cached === 'undefined') throw new Error('Unexpected empty cache entry');
      return this.parseFromLocalCache(cached);
    }

    const requests = new Array();
    requests.push(params);
    const headers = {
      'Content-Type': 'application/json',
    };
    const response = await axios({
      method: 'post',
      headers,
      url: this.options.endpoint,
      data: JSON.stringify({ requests }),
      responseType: 'json',
      proxy: this.options.proxy,
    });
    const json = response.data as unknown as Array<WpData>;
    json.forEach((response) => {
      this.debugLog(response);
      this.handleError(response);
    });

    if ((params as any).localCache) {
      this.cache.set(params.hash, json[0]);
    }
    return json[0] || {} as WpData;
  }

  public async upload(files: Array<File> | File): Promise<Array<WpFile>> {
    if (typeof this.options.uploadEndpoint === 'undefined') throw new Error('No upload endpoint defined');
    files = Array.isArray(files) ? files: [files];

    const responses: Array<Promise<Response>> = files.map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      const request = new Request(this.options.uploadEndpoint, { method: 'POST', body: formData });
      return fetch(request);
    });
    const promisesResponses = await Promise.all(responses);
    const jsons: Array<Promise<WpFile>> = promisesResponses.map(response => response.json());
    return Promise.all(jsons);
  }

  private async sendOnce(): Promise<Array<object>> {
    // This will contains the already fetched data extrapolated from the local cache and the original array index
    const cachedDates: Array<{ index: number, data: object }> = [];
    // This will contain all un-cacheable and all the uncached requests
    const uncachedRequests: Array<
      DemetraRequestLanguages |
      DemetraRequestSiteMap |
      DemetraRequestPage |
      DemetraRequestChildren |
      DemetraRequestArchive |
      DemetraRequestExtra |
      DemetraRequestTaxonomy
    > = [];

    this.queue.requests.forEach((request, index) => {
      if (request.localCache && this.cache.has(request.hash)) {
        const cached = this.cache.get(request.hash) || {} as WpData;
        cachedDates.push({ index, data: this.parseFromLocalCache(cached) });
      } else {
        uncachedRequests.push(request);
      }
    })

    // Inject endpoint and all configuration taken from demetra instance options
    const headers = {
      'Content-Type': 'application/json',
    };
    const response = await axios({
      method: 'post',
      headers,
      url: this.options.endpoint,
      data: JSON.stringify({ requests: uncachedRequests }),
      responseType: 'json',
      proxy: this.options.proxy,
    });
    const responses = response.data as unknown as Array<WpData>;
    uncachedRequests.forEach((request, index) => {
      if (request.localCache) { this.cache.set(request.hash, responses[index]); }
    });


    // Merge cached data with fetch data in the original index
    cachedDates.forEach((cachedData) => {
      responses.splice(cachedData.index, 0, cachedData.data as WpData);
    });

    responses.forEach((response) => {
      this.debugLog(response);
      this.handleError(response);
    });

    return responses;
  }

  private async sendSimultaneously(): Promise<Array<WpData>> {
    const promises: Array<Promise<WpData>> = this.queue.requests.map(request => this.fetch(request));
    return Promise.all(promises);
  }

  private async sendConsequentially(): Promise<Array<WpData>> {
    const responses: Array<WpData> = [];
    for (const request of this.queue.requests) {
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
