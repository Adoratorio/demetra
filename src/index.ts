import LRUCache from 'lru-cache';
import fetch from 'cross-fetch';

import DemetraRequest from './DemetraRequest';
import { validateUrl } from './validators';
import { DEMETRA_OPTIONS, SEND_MODES, WP_MODES } from './defaults';
import {
  DemetraOptions,
  FetchArchiveOptions,
  FetchExtraOptions,
  FetchMenuOptions,
  FetchPageOptions,
  FetchTaxonomyOptions,
  WpData, DemetraRequestOptions,
} from './declarations';

class Demetra {
  private static readonly DEFAULT_OPTIONS = DEMETRA_OPTIONS;

  public static readonly WP_MODES = WP_MODES;

  public static readonly SEND_MODES = SEND_MODES;

  private static LRUCache: LRUCache<string, WpData> | undefined;

  private readonly requestQueue: Array<DemetraRequest>;

  private options: DemetraOptions;

  constructor(options: Partial<DemetraOptions> = {}) {
    this.options = { ...Demetra.DEFAULT_OPTIONS, ...options };
    this.requestQueue = [];

    if (this.options.endpoint.length <= 0 || !validateUrl(this.options.endpoint)) {
      throw new Error('Invalid endpoint');
    }

    if (this.options.uploadEndpoint.length <= 0) {
      this.options.uploadEndpoint = this.options.endpoint.replace('/api.php', '/upload.php');
    }
  }

  public addQueue(requestOptions: DemetraRequest): void {
    this.requestQueue.push(requestOptions);
  }

  public clearQueue(): void {
    this.requestQueue.length = 0;
  }

  public async fetchQueue(sendModes: SEND_MODES = SEND_MODES.ONCE): Promise<Array<object>> {
    if (sendModes === SEND_MODES.ONCE) {
      return this.sendOnce(this.requestQueue);
    }

    if (sendModes === SEND_MODES.SIMULTANEOUSLY) {
      return this.sendSimultaneously(this.requestQueue);
    }

    if (sendModes === SEND_MODES.AWAIT) {
      return this.sendAwait(this.requestQueue);
    }

    throw new Error('Invalid SEND_MODES')
  }

  public async fetchPage(id: string | number, options?: Partial<FetchPageOptions>): Promise<object> {
    const request = new DemetraRequest(Demetra.WP_MODES.PAGE, id, options);
    return this.getResponse(request);
  }

  public async fetchArchive(id: string, options?: Partial<FetchArchiveOptions>): Promise<object> {
    const request = new DemetraRequest(Demetra.WP_MODES.ARCHIVE, id, options);
    return this.getResponse(request);
  }

  public async fetchExtra(id: string, options?: Partial<FetchExtraOptions>): Promise<object> {
    const request = new DemetraRequest(Demetra.WP_MODES.EXTRA, id, options);
    return this.getResponse(request);
  }

  public async fetchMenu(id: string, options?: Partial<FetchMenuOptions>): Promise<object> {
    const request = new DemetraRequest(Demetra.WP_MODES.MENU, id, options);
    return this.getResponse(request);
  }

  public async fetchTaxonomy(id: string, options?: Partial<FetchTaxonomyOptions>): Promise<object> {
    const request = new DemetraRequest(Demetra.WP_MODES.TAXONOMY, id, options);
    return this.getResponse(request);
  }

  public async subscribe(email: string): Promise<object> {
    const request = new DemetraRequest(Demetra.WP_MODES.SUBSCRIBE, email);
    return this.getResponse(request);
  }

  public async send(id: number, recipients: string, data: Record<string, unknown>): Promise<object> {
    let urls: Array<string> = []
    const attachments: Array<File> = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        attachments.push(value)
        delete data[key]
      }
    })

    if (attachments.length > 0) {
      const uploadResponse: Array<object> = await this.upload(attachments);

      uploadResponse.forEach((url) => {
        if (typeof url !== 'object') {
          throw new Error('Invalid response. It mus be an object');
        }
        if (!url.hasOwnProperty('file')) {
          throw new Error('Invalid File Response');
        }
        // TODO: REMOVE
        // @ts-ignore
        urls.push(url.file.url)
      });
    }

    const request = new DemetraRequest(Demetra.WP_MODES.SEND, id, { data, recipients, urls, });
    return this.getResponse(request);
  }

  public async upload(files : Array<File> | File) : Promise<Array<object>> {
    if (typeof this.options.uploadEndpoint === 'undefined') throw new Error('No upload endpoint defined');
    files = Array.isArray(files) ? files : [files];

    const promises = files.map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(this.options.uploadEndpoint, DemetraRequest.addConfig(formData));
    });

    const responses = await Promise.all(promises);

    return responses.map((response) => {
      return this.getData(response)
    });
  }

  private async getResponse(request: DemetraRequest): Promise<object> {
    let data;

    if (request.localCache) {
      // Required to check local cache
      if (this.cache.has(request.hash)) {
        // Return the cached response
        data = this.cache.get(request.hash);
      } else {
        const response = await fetch(this.endpoint, request.config);
        data = await this.getData(response);
        this.cache.set(request.hash, data[0]); // Use data[0] 'cause we send only one request
      }
    } else {
      // Local cache check is not required, send the request and return
      // the parsed response body
      const response = await fetch(this.endpoint, request.config);
      data = await this.getData(response);
    }

    if (typeof data === 'undefined') throw new Error('Response body is unexpectedly empty');

    return data;
  }

  private async sendOnce(requestQueue: Array<DemetraRequest>): Promise<Array<object>> {
    // This will contains the already fetched data extrapolated from the local cache and the original array index
    const cachedDates : Array<{ index: number, data: object }> = [];
    // This will contain all un-cacheable and all the uncached requests
    const uncachedRequests : Array<DemetraRequest> = [];

    requestQueue.forEach((request, index) => {
      if (request.localCache && this.cache.has(request.hash)) {
        cachedDates.push({ index, data: this.cache.get(request.hash) || {} });
      } else {
        uncachedRequests.push(request);
      }
    })

    const optionsQueue: Array<DemetraRequestOptions> = uncachedRequests.map(request => request.options);
    // Inject endpoint and all configuration taken from demetra instance options
    const requestConfig = DemetraRequest.addConfig(JSON.stringify(optionsQueue));
    const response = await fetch(this.endpoint as RequestInfo, requestConfig);
    const wpData = await this.getData(response);

    const data = wpData.map(wp => wp.data);

    uncachedRequests.forEach((request: DemetraRequest, index: number) => {
      if (request.localCache) { this.cache.set(request.hash, wpData[index]); }
    });


    // merge cached data with fetch data in the original index
    cachedDates.forEach(cachedData => {
      data.splice(cachedData.index, 0, cachedData.data)
    })

    return data;
  }

  private async sendSimultaneously(requestQueue: Array<DemetraRequest>): Promise<Array<object>> {
    const promises: Array<Promise<object>> = requestQueue.map((request) => {
      return this.getResponse(request);
    });

    return Promise.all(promises);
  }

  private async sendAwait(requestQueue: Array<DemetraRequest>): Promise<Array<object>> {
    const wpDataQueue = []

    for (const request of requestQueue) {
      wpDataQueue.push(await this.getResponse(request))
    }
    return wpDataQueue
  }

  private debugLog(response: Response) {
    if (this.options.debug) {
      console.log(response);
    }
  }

  private handleError(response: Response) {
    if (!response.ok) {
      if (this.options.debug) {
        console.error(`${response.status} - ${response.statusText}`);
      }
      throw new Error(`${response.status} - ${response.statusText}`);
    }
  }

  private async getData(response: Response) : Promise<Array<WpData>> {
    this.debugLog(response);
    this.handleError(response);
    return response.json();
  }

  private get cache(): LRUCache<string, WpData> {
    if (typeof Demetra.LRUCache === 'undefined') {
      return Demetra.LRUCache = new LRUCache(this.options.cacheMaxAge);
    } else {
      return Demetra.LRUCache
    }
  }

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
export { DemetraRequest };
