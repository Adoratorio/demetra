import LRUCache from 'lru-cache';
import fetch from 'cross-fetch';

import DemetraRequest from './DemetraRequest';
import { isEmpty, validateUrl } from './validators';
import { DEMETRA_OPTIONS, SEND_MODES, WP_MODES } from './defaults';
import {
  DemetraOptions,
  FetchArchiveOptions,
  FetchExtraOptions,
  FetchMenuOptions,
  FetchPageOptions,
  FetchTaxonomyOptions,
  wpData, DemetraRequestOptions,
} from './declarations';

class Demetra {
  private static readonly DEFAULT_OPTIONS = DEMETRA_OPTIONS;

  public static readonly WP_MODES = WP_MODES;

  public static readonly SEND_MODES = SEND_MODES;

  private static LRUCache: LRUCache<string, wpData> | undefined;

  private readonly requestQueue: Array<DemetraRequest>;

  private options: DemetraOptions;

  constructor(options: Partial<DemetraOptions> = {}) {
    this.options = { ...Demetra.DEFAULT_OPTIONS, ...options };
    this.requestQueue = [];

    this.validate();
  }

  /*
   * public function
   */
  public addQueue(requestOptions: DemetraRequest): void {
    this.requestQueue.push(requestOptions);
  }

  public clearQueue(): void {
    this.requestQueue.length = 0;
  }

  // eslint-disable-next-line consistent-return
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

  // public async send(id: number, recipients: string, data: FormData, options?: Partial<FetchSendOptions>) {
  //   const urls: Array<string> = [];
  //
  //   for (const [key, value] of Object.entries(data)) {
  //     if (isFile(value)) {
  //       const uploadResponse : Array<any> = await this.upload(value);
  //
  //       if (typeof uploadResponse !== 'object') {
  //         throw new Error('Invalid response. It mus be an object');
  //       }
  //       if (!uploadResponse.hasOwnProperty('file')) {
  //         throw new Error('Invalid File Response');
  //       }
  //
  //       const { url } = (uploadResponse).file;
  //       data.delete(key);
  //       urls.push(url);
  //     }
  //   }
  //
  //   const request = new DemetraRequest(Demetra.WP_MODES.EXTRA, id, {
  //     ...options,
  //     ...data,
  //     recipients,
  //     urls,
  //   });
  //   return this.getResponse(request);
  // }

  public async subscribe(email: string): Promise<object> {
    const request = new DemetraRequest(Demetra.WP_MODES.SUBSCRIBE, email);
    return this.getResponse(request);
  }

  // TODO: SICURAMENTE L UPLOAD ERA SBAGLIATO PERCHè CARICA SOLO UN FILE ALLA VOLTA E NON IL FILE LIST
  // public async upload(file: File): Promise<Array<any>> {
  //   if (isUndefined(this.options.uploadEndpoint))
  //     throw new Error('No upload endpoint defined');
  //
  //   const formData: FormData = new FormData();
  //   formData.append('file', file);
  //
  //   DemetraRequest.serialize(file)
  //
  //   const requestConfig: RequestInit = DemetraRequest.addConfig(formData);
  //   const response = await fetch(this.endpoint, requestConfig);
  //   // return this.validateResponse(response); // TODO: REINSERIRE
  // }

  /*
   * private function
   */
  private async getResponse(request: DemetraRequest): Promise<object> {
    let data;

    // check if cache is required
    if (request.localCache) {
      // check if key exist
      if (this.cache.has(request.key)) {
        data = this.cache.get(request.key);
      } else {
        const response = await fetch(this.endpoint, request.config);
        data = await this.getData(response)
        this.cache.set(request.key, data[0]);
      }
    } else {
      const response = await fetch(this.endpoint, request.config);
      data = await this.getData(response)
    }

    if (typeof data === 'undefined') {
      throw new Error('Empty or undefined data')
    }

    if (Array.isArray(data)) {
      return data[0].data
    }
    return data;
  }

  private validate(): void {
    if (isEmpty(this.options.endpoint)) {
      throw new Error('Endpoint cannot be undefined');
    }

    if (!validateUrl(this.options.endpoint)) {
      throw new Error('Invalid endpoint');
    }

    if (isEmpty(this.options.uploadEndpoint)) {
      this.options.uploadEndpoint = this.options.endpoint.replace('/api.php', '/upload.php');
    }
  }

  private async sendOnce(requestQueue: Array<DemetraRequest>): Promise<Array<object>> {
    const cachedData: Array<object> = [];

    const uncachedRequest = requestQueue.filter(async (request) => {
      if (!request.localCache) {
        return true;
      }

      if (this.cache.has(request.key)) {
        cachedData.push( await this.getResponse(request));
        return false;
      }

      return true;

    });

    const optionsQueue: Array<DemetraRequestOptions> = uncachedRequest.map(request => request.options);
    const formData = DemetraRequest.serialize(optionsQueue)
    const requestConfig = DemetraRequest.addConfig(formData);
    const response = await fetch(this.endpoint as RequestInfo, requestConfig);
    const wpData = await this.getData(response)

    const data = wpData.map(wp => wp.data)

    uncachedRequest.forEach((request: DemetraRequest, index: number) => {
      if (request.localCache) { this.cache.set(request.key, wpData[index]); }
    });

    return data.concat(cachedData);
  }

  private async sendSimultaneously(requestQueue: Array<DemetraRequest>): Promise<Array<object>> {
    const promises: Array<Promise<object>> = requestQueue.map((request) => {
      return this.getResponse(request);
    });

    return Promise.all(promises);
  }

  private async sendAwait(requestQueue: Array<DemetraRequest>): Promise<Array<object>> {
    const wpDataQueue = []

    // eslint-disable-next-line no-restricted-syntax
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

  private async getData(response: Response) : Promise<Array<wpData>> {
    this.debugLog(response);
    this.handleError(response);
    return response.json();
  }

  /*
   * getter & setter
   */
  private get cache(): LRUCache<string, wpData> {
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

  // public get lang(): string {
  //   return this.options.lang;
  // }
  //
  // public set lang(lang: string) {
  //   this.options.lang = lang;
  // }
}

export default Demetra;
export { DemetraRequest };
