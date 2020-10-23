/* eslint-disable */
import LRUCache from 'lru-cache';
import fetch from 'cross-fetch';
import FormData from 'form-data'

import DemetraRequest from './DemetraRequest';
import serialize from './object-to-formdata';
import { isEmpty, isFile, validateUrl, isUndefined } from './validators';
import {
  DemetraOptions,
  FetchArchiveOptions,
  FetchExtraOptions,
  FetchMenuOptions,
  FetchOptions,
  FetchPageOptions,
  FetchSendOptions,
  FetchTaxonomyOptions,
  MODES,
} from './declarations';

class Demetra {
  private cache: LRUCache<string, Response>;

  private readonly options: DemetraOptions;

  private readonly requestQueue: Array<DemetraRequest>;

  public static readonly MODES = MODES;

  public defaults: DemetraOptions = {
    endpoint: '',
    uploadEndpoint: '',
    site: 'default',
    lang: 'en',
    debug: false,
    cacheMaxAge: 1000 * 60 * 60,
  };

  constructor(options?: Partial<DemetraOptions>) {
    this.options = { ...this.defaults, ...options };
    this.cache = new LRUCache(this.options.cacheMaxAge);
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

  public async fetchQueue(
    sendModes: 'once' | 'simultaneously' | 'await' = 'once'
  ): Promise<object> {
    switch (sendModes) {
      case 'once':
        return this.sendOnce(this.requestQueue);
      case 'simultaneously':
        return this.sendSimultaneously(this.requestQueue);
      case 'await':
        return this.sendAwait(this.requestQueue);
      default:
        return this.sendOnce(this.requestQueue);
    }
  }

  public async fetchPage(id: string | number, options?: Partial<FetchPageOptions>) : Promise<any[]> {
    // @ts-ignore
    if (isUndefined(options) && isUndefined(options.lang)) {
      // @ts-ignore
      options.lang = this.defaults.lang;
    }
    const request = new DemetraRequest(Demetra.MODES.PAGE, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response);
  }

  public async fetchArchive(id: string, options?: Partial<FetchArchiveOptions>) {
    const request = new DemetraRequest(Demetra.MODES.ARCHIVE, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response);
  }

  public async fetchExtra(id: string, options?: Partial<FetchExtraOptions>) {
    const request = new DemetraRequest(Demetra.MODES.EXTRA, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response);
  }

  public async fetchMenu(id: string, options?: Partial<FetchMenuOptions>) {
    const request = new DemetraRequest(Demetra.MODES.MENU, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response);
  }

  public async fetchTaxonomy(id: string, options?: Partial<FetchTaxonomyOptions>) {
    const request = new DemetraRequest(Demetra.MODES.TAXONOMY, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response);
  }

  public async send(
    id: number,
    recipients: string,
    data: FormData,
    options?: Partial<FetchSendOptions>
  ) {
    const urls: Array<string> = [];

    for (const [key, value] of Object.entries(data)) {
      if (isFile(value)) {
        const uploadResponse : Array<any> = await this.upload(value);

        if (typeof uploadResponse !== 'object') {
          throw new Error('Invalid response. It mus be an object');
        }
        if (!uploadResponse.hasOwnProperty('file')) {
          throw new Error('Invalid File Response');
        }

        // @ts-ignore
        const { url } = (uploadResponse).file;
        // @ts-ignore
        data.delete(key);
        urls.push(url);
      }
    }

    const request = new DemetraRequest(Demetra.MODES.EXTRA, id, {
      ...options,
      ...data,
      recipients,
      urls,
    });
    const response = await this.getResponse(request);
    return this.validateResponse(response);
  }

  public async subscribe(email: string): Promise<Array<any>> {
    const request = new DemetraRequest(Demetra.MODES.SUBSCRIBE, email);
    const response = await this.getResponse(request);
    return this.validateResponse(response);
  }

  public async upload(file: File): Promise<Array<any>> {
    if (isUndefined(this.options.uploadEndpoint))
      throw new Error('No upload endpoint defined');

    const formData: FormData = new FormData();
    formData.append('file', file);

    // @ts-ignore
    const requestConfig: RequestInit = DemetraRequest.addConfig(formData);
    const response = await fetch(this.endpoint, requestConfig);
    return this.validateResponse(response);
  }

  /*
   * private function
   */
  private async getResponse(request: DemetraRequest): Promise<Response> {
    let response: Response | undefined;

    // check if cache is required
    if (request.localCache) {
      // check if key exist
      if (this.cache.has(request.key)) {
        console.log('se ha la key prende dalla cache');
        response = this.cache.get(request.key);
        console.log('la risposta dalla cache è: ', response);
      } else {
        console.log('se non ha la fa la fetch');
        response = await fetch(this.endpoint, request.config);
        this.cache.set(request.key, response);
      }
    } else {
      response = await fetch(this.endpoint, request.config);
    }

    // @ts-ignore
    return response;
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

  private async sendOnce(requestQueue: Array<DemetraRequest>): Promise<object> {
    const cachedData: Array<object> = [];

    const uncachedRequest: Array<DemetraRequest> = requestQueue.filter((request) => {
      if (!request.localCache) {
        return true;
      }
      if (this.cache.has(request.key)) {
        // @ts-ignore
        cachedData.push(this.cache.get(request.key));
        return false;
      } else {
        return true;
      }
    });

    const optionsQueue: Array<FetchOptions> = uncachedRequest.map((request) => request.options);
    // TODO: il form data va inserito all interno del demetra request in modo da eliminare la dipendenza da Demetra
    // @ts-ignore
    const formData: FormData = serialize(optionsQueue, { indices: true }, undefined, 'requests');
    // @ts-ignore
    const requestConfig: RequestInit = DemetraRequest.addConfig(formData);
    const response: Response = await fetch(this.endpoint as RequestInfo, requestConfig);

    const dataArray = await this.validateResponse(response);
    if (!Array.isArray(dataArray)) {
      throw new Error('Invalid response. It mus be an array');
    }

    uncachedRequest.forEach((request: DemetraRequest, index: number) => {
      if (request.localCache) {
        // @ts-ignore
        this.cache.set(request.key, dataArray[index]);
      }
    });

    // @ts-ignore
    return dataArray.concat(cachedData);
  }

  private async sendSimultaneously(requestQueue: Array<DemetraRequest>): Promise<object> {
    const promises: Array<Promise<Response>> = requestQueue.map((request) => {
      return this.getResponse(request);
    });

    const responseQueue: Response[] | void = await Promise.all(promises);

    const validResponseQueue: Array<Array<any>> = [];

    for (const response of responseQueue) {
      const validResponse = await this.validateResponse(response);
      if (Array.isArray(validResponse)) {
        // @ts-ignore
        validResponseQueue.push(...validResponse);
      } else {
        validResponseQueue.push(validResponse);
      }
    }

    return validResponseQueue;
  }

  private async sendAwait(requestQueue: Array<DemetraRequest>): Promise<any[]> {
    const validResponseQueue: Array<Array<any>> = [];

    for (const request of requestQueue) {
      const response: Response = await this.getResponse(request);
      const validResponse = await this.validateResponse(response);
      if (Array.isArray(validResponse)) {
        // @ts-ignore
        validResponseQueue.push(...validResponse);
      } else {
        validResponseQueue.push(validResponse);
      }
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

  private async validateResponse(response: Response): Promise<Array<{ data: object, status: object }>> {
    this.debugLog(response);
    this.handleError(response);
    // TODO: return only data and not status
    return response.json();
  }

  /*
   * getter & setter
   */
  public get endpoint(): string {
    return this.options.endpoint;
  }

  public set endpoint(url: string) {
    this.options.endpoint = url;
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
