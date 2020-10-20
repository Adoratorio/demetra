import LRUCache from 'lru-cache';
import { serialize } from 'object-to-formdata';

import DemetraRequest from './DemetraRequest';
import { isEmpty, isFile, validateUrl } from './validators';
import {
  MODES,
  DemetraOptions,
  FetchArchiveOptions,
  FetchExtraOptions,
  FetchMenuOptions,
  FetchOptions,
  FetchPageOptions,
  FetchSendOptions,
  FetchTaxonomyOptions,
} from './declarations';


class Demetra {
  private cache : any;
  private readonly options : DemetraOptions;
  private readonly requestQueue : Array<DemetraRequest>;
  private static readonly MODES = MODES;

  public defaults : DemetraOptions = {
    endpoint: '',
    uploadEndpoint: '',
    site: 'default',
    lang: 'en',
    debug: false,
    cacheMaxAge: 1000 * 60 * 60,
  };

  constructor(options? : Partial<DemetraOptions>) {
    this.options = {...this.defaults, ...options};
    this.cache = null;
    this.requestQueue = [];

    this.validate();
  }

  /*
   * public function
   */
  public addQueue(requestOptions : DemetraRequest) : void {
    this.requestQueue.push(requestOptions)
  }

  public clearQueue() : void {
    this.requestQueue.length = 0
  }

  public async fetchQueue(sendModes : 'once' | 'simultaneously' | 'await' = 'once') : Promise<object> {
    switch (sendModes) {
      case 'once':
        return await this.sendOnce(this.requestQueue)
      case 'simultaneously':
        return await this.sendSimultaneously(this.requestQueue);
      case 'await':
        return await this.sendAwait(this.requestQueue);
    }
  }

  public async fetchPage(id : string | number, options? : Partial<FetchPageOptions>) {
    if (typeof options !== 'undefined' && typeof options.lang === 'undefined') options.lang = this.defaults.lang;
    const request = new DemetraRequest(Demetra.MODES.PAGE, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response)
  }

  public async fetchArchive(id : string, options? : Partial<FetchArchiveOptions>) {
    const request = new DemetraRequest(Demetra.MODES.ARCHIVE, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response)
  }

  public async fetchExtra(id : string, options? : Partial<FetchExtraOptions>) {
    const request = new DemetraRequest(Demetra.MODES.EXTRA, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response)
  }

  public async fetchMenu(id: string, options? : Partial<FetchMenuOptions>) {
    const request = new DemetraRequest(Demetra.MODES.MENU, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response)
  }

  public async fetchTaxonomy(id : | number, options? : Partial<FetchTaxonomyOptions>) {
    const request = new DemetraRequest(Demetra.MODES.TAXONOMY, id, options);
    const response = await this.getResponse(request);
    return this.validateResponse(response)
  }

  // recipients : string, data : string, attachments : Array<File>
  public async send(id: number, recipients : string, data : FormData, options? : Partial<FetchSendOptions>) {
    const urls : Array<string> = [];

    for (const [key, value] of Object.entries(data)) {
      if (isFile(value)) {
        const uploadResponse = await this.upload(value);

        if (typeof uploadResponse !== 'object') { throw new Error('Invalid response. It mus be an object')}
        if (!uploadResponse.hasOwnProperty('file')) { throw new Error('Invalid File Response') }

        const url = (uploadResponse as any).file.url;
        data.delete(key);
        urls.push(url);
      }
    }

    const request = new DemetraRequest(Demetra.MODES.EXTRA, id, {...options, ...data, recipients, urls});
    const response = await this.getResponse(request);
    return this.validateResponse(response)
  }

  public async subscribe(email: string) {
    const request = new DemetraRequest(Demetra.MODES.SUBSCRIBE, email);
    const response = await this.getResponse(request);
    return this.validateResponse(response)
  }

  public async upload(files : File | Array<File>) {
    if (typeof this.options.uploadEndpoint === 'undefined') throw new Error('No upload endpoint defined');

    const fs = Array.isArray(files) ? files : [files];

    const promises : Array<Promise<Response>> = fs.map((file : File) => {
      const formData : FormData = new FormData();
      formData.append('file', file);

      const requestConfig : RequestInit = DemetraRequest.addConfig(formData);
      return fetch(this.endpoint as RequestInfo, requestConfig);
    });

    const responses = await Promise.all(promises);
    responses.forEach((response : Response) => {
      this.debugLog(response);
      this.handleError(response);
    });

    return responses.map((response : Response) => {
      return this.validateResponse(response);
    });
  }

  /*
   * private function
   */
  private async getResponse(request : DemetraRequest) : Promise<Response> {
    let response : Response;

    // check if cache is required
    if (request.localCache) {
      // check if cache was instantiate
      if (!this.cache) {
        this.cache = new LRUCache(this.options.cacheMaxAge)
      }
      // check if key exist
      if (this.cache.has(request.key)) {
        response = this.cache.get(request.key)
      } else {
        response = await fetch(this.endpoint as RequestInfo, request.config);
        this.cache.set(request.key, response)
      }
    } else {
      response = await fetch(this.endpoint as RequestInfo, request.config);
    }

    return response;
  }

  private validate() : void {
    if (isEmpty(this.options.endpoint)) {
      throw new Error('Endpoint cannot be undefined')
    }

    if (!validateUrl(this.options.endpoint)) {
      throw new Error('Invalid endpoint');
    }

    if (isEmpty(this.options.uploadEndpoint)) {
      this.options.uploadEndpoint = this.options.endpoint.replace('/api.php', '/upload.php');
    }
  }

  private async sendOnce(requestQueue : Array<DemetraRequest>) : Promise<object> {
    const cachedData : Array<object> = [];

    const uncachedRequest : Array<DemetraRequest> = requestQueue.filter(request => {
      if (!request.localCache) {
        return true;
      } else {
        if (!this.cache) {
          this.cache = new LRUCache(this.options.cacheMaxAge)
        }
        if (this.cache.has(request.key)) {
          cachedData.push(this.cache.get(request.key));
          return false;
        } else {
          return true;
        }
      }
      })

    const optionsQueue : Array<FetchOptions> = uncachedRequest.map(request => request.options);
    const formData : FormData = serialize(optionsQueue);
    const requestConfig : RequestInit = DemetraRequest.addConfig(formData);
    const response : Response = await fetch(this.endpoint as RequestInfo, requestConfig);

    const dataArray = this.validateResponse(response)
    if (!Array.isArray(dataArray)) { throw new Error('Invalid response. It mus be an array') }

    uncachedRequest.forEach((request : DemetraRequest, index: number) => {
      if (request.localCache) { this.cache.set(request.key, dataArray[index]) }
    })

    return dataArray.concat(cachedData)
  }

  private async sendSimultaneously(requestQueue : Array<DemetraRequest>) : Promise<object> {
    const promises : Array<Promise<Response>> = requestQueue.map((request) => {
      return this.getResponse(request);
    })
    const responseQueue : Response[] | void = await Promise.all(promises)

    return responseQueue.map(response => {
      return this.validateResponse(response)
    })
  }

  private async sendAwait(requestQueue : Array<DemetraRequest>) : Promise<any[]> {
    const responseArray : Array<object | Array<any> | string | number> = [];

    for (const request of requestQueue) {
      const response : Response = await this.getResponse(request)
      responseArray.push(this.validateResponse(response));
    }

    return responseArray
  }

  private debugLog(response : Response) {
    if (this.options.debug) console.log(response);
  }

  private handleError(response : Response) {
    if (response.ok) {
      if (this.options.debug) {
        console.error(`${response.status} - ${response.statusText}`);
      }
      throw new Error(`${response.status} - ${response.statusText}`);
    }
  }

  private validateResponse(response : Response) : object | Array<any> | string | number {
    this.debugLog(response);
    this.handleError(response)

    return response.json();
  }

  /*
   * getter & setter
   */
  public get endpoint() : string {
    return this.options.endpoint;
  }

  public set endpoint(url : string) {
    this.options.endpoint = url;
  }

  public get lang() : string {
    return this.options.lang;
  }

  public set lang(lang : string) {
    this.options.lang = lang;
  }
}
