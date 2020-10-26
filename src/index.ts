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
  wpData,
} from './declarations';

class Demetra {
  private readonly requestQueue: Array<DemetraRequest>;

  private options: DemetraOptions;

  private static readonly DEFAULT_OPTIONS: DemetraOptions = DEMETRA_OPTIONS;

  public static readonly WP_MODES = WP_MODES;

  public static readonly SEND_MODES = SEND_MODES;

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
  public async fetchQueue(sendModes: SEND_MODES = SEND_MODES.ONCE): Promise<Array<wpData>> {
    if (sendModes === SEND_MODES.ONCE) {
      // return this.sendOnce(this.requestQueue);
    }

    if (sendModes === SEND_MODES.SIMULTANEOUSLY) {
      return this.sendSimultaneously(this.requestQueue);
    }

    if (sendModes === SEND_MODES.AWAIT) {
      return this.sendAwait(this.requestQueue);
    }

    throw new Error('Invalid Mode')
  }

  public async fetchPage(id: string | number, options?: Partial<FetchPageOptions>): Promise<wpData> {
    const request = new DemetraRequest(Demetra.WP_MODES.PAGE, id, options);
    return this.getResponse(request);
  }

  public async fetchArchive(id: string, options?: Partial<FetchArchiveOptions>): Promise<wpData> {
    const request = new DemetraRequest(Demetra.WP_MODES.ARCHIVE, id, options);
    return this.getResponse(request);
  }

  public async fetchExtra(id: string, options?: Partial<FetchExtraOptions>): Promise<wpData> {
    const request = new DemetraRequest(Demetra.WP_MODES.EXTRA, id, options);
    return this.getResponse(request);
  }

  public async fetchMenu(id: string, options?: Partial<FetchMenuOptions>): Promise<wpData> {
    const request = new DemetraRequest(Demetra.WP_MODES.MENU, id, options);
    return this.getResponse(request);
  }

  public async fetchTaxonomy(id: string, options?: Partial<FetchTaxonomyOptions>): Promise<wpData> {
    const request = new DemetraRequest(Demetra.WP_MODES.TAXONOMY, id, options);
    return this.getResponse(request);
  }

  // public async send(
  //   id: number,
  //   recipients: string,
  //   data: FormData,
  //   options?: Partial<FetchSendOptions>
  // ) {
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

  // public async subscribe(email: string): Promise<Array<any>> {
  //   const request = new DemetraRequest(Demetra.WP_MODES.SUBSCRIBE, email);
  //   return this.getResponse(request);
  // }

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
  private async getResponse(request: DemetraRequest): Promise<wpData> {
    let data;

    // check if cache is required
    if (request.localCache) {
      // check if key exist
      if (this.cache.has(request.key)) {
        data = this.cache.get(request.key);
      } else {
        const response = await fetch(this.endpoint, request.config);
        this.debugLog(response);
        this.handleError(response);
        // TODO: return only data and not status
        data = await response.json();
        this.cache.set(request.key, data);
      }
    } else {
      const response = await fetch(this.endpoint, request.config);
      this.debugLog(response);
      this.handleError(response);
      data = await response.json();
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

  // private async sendOnce(requestQueue: Array<DemetraRequest>): Promise<object> {
  //   const cachedData: Array<object> = [];
  //
  //   const uncachedRequest: Array<DemetraRequest> = requestQueue.filter((request) => {
  //     if (!request.localCache) {
  //       return true;
  //     }
  //     if (this.cache.has(request.key)) {
  //       // @ts-ignore
  //       cachedData.push(this.cache.get(request.key));
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   });
  //
  //   const optionsQueue: Array<FetchOptions> = uncachedRequest.map((request) => request.options);
  //   // TODO: il form data va inserito all interno del demetra request in modo da eliminare la dipendenza da Demetra
  //   // @ts-ignore
  //   const formData: FormData = serialize(optionsQueue, { indices: true }, undefined, 'requests');
  //   // @ts-ignore
  //   const requestConfig: RequestInit = DemetraRequest.addConfig(formData);
  //   const response: Response = await fetch(this.endpoint as RequestInfo, requestConfig);
  //
  //   const dataArray = await this.validateResponse(response);
  //   if (!Array.isArray(dataArray)) {
  //     throw new Error('Invalid response. It mus be an array');
  //   }
  //
  //   uncachedRequest.forEach((request: DemetraRequest, index: number) => {
  //     if (request.localCache) {
  //       // @ts-ignore
  //       this.cache.set(request.key, dataArray[index]);
  //     }
  //   });
  //
  //   // @ts-ignore
  //   return dataArray.concat(cachedData);
  // }

  private async sendSimultaneously(requestQueue: Array<DemetraRequest>): Promise<Array<wpData>> {
    const promises: Array<Promise<wpData>> = requestQueue.map((request) => {
      return this.getResponse(request);
    });

    return Promise.all(promises);
  }

  private async sendAwait(requestQueue: Array<DemetraRequest>): Promise<Array<wpData>> {
    const validResponseQueue: Array<wpData> = [];

    for (const request of requestQueue) {
      validResponseQueue.push(await this.getResponse(request));
    }

    return validResponseQueue;
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

  /*
   * getter & setter
   */
  private get cache(): LRUCache<string, wpData> {
    return new LRUCache(this.options.cacheMaxAge);
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
