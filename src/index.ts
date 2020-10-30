import LRUCache from 'lru-cache';
import fetch, { Headers, Request } from 'cross-fetch';
import { validateUrl } from './validators';
import { DemetraOptions, SEND_MODES, WpData, WpFile } from './declarations';
import DemetraRequest from './Requests/DemetraRequest';
import DemetraQueue from './Requests/DemetraQueue';
import DemetraRequestPage from './Requests/DemetraRequestPage';
import DemetraRequestArchive from './Requests/DemetraRequestArchive';
import DemetraRequestExtra from './Requests/DemetraRequestExtra';
import DemetraRequestMenu from './Requests/DemetraRequestMenu';
import DemetraRequestTaxonomy from './Requests/DemetraRequestTaxonomy';
import DemetraRequestSend from './Requests/DemetraRequestSend';
import DemetraRequestSubscribe from './Requests/DemetraRequestSubscribe';

class Demetra {
  public static readonly SEND_MODES = SEND_MODES;
  private readonly cache : LRUCache<string, WpData>;
  private readonly queue : DemetraQueue;
  private options : DemetraOptions;

  constructor(options: Partial<DemetraOptions> = {}) {
    const defaults : DemetraOptions = {
      endpoint: '',
      uploadEndpoint: '',
      site: 'default',
      lang: 'en',
      debug: false,
      version : 2,
      cacheMaxAge: 1000 * 60 * 60,
    }
    this.options = { ...defaults, ...options };
    this.queue = new DemetraQueue;
    this.cache = new LRUCache(this.options.cacheMaxAge);

    if (this.options.endpoint.length <= 0 || !validateUrl(this.options.endpoint)) {
      throw new Error('Invalid endpoint');
    }

    if (this.options.uploadEndpoint.length <= 0) {
      this.options.uploadEndpoint = this.options.endpoint.replace('/api.php', '/upload.php');
    }
  }

  public async fetchQueue(sendModes: SEND_MODES = SEND_MODES.ONCE): Promise<Array<object>> {
    if (sendModes === SEND_MODES.ONCE) {
      return this.sendOnce();
    }

    if (sendModes === SEND_MODES.SIMULTANEOUSLY) {
      return this.sendSimultaneously();
    }

    if (sendModes === SEND_MODES.AWAIT) {
      return this.sendConsequentially();
    }

    throw new Error('Invalid SEND_MODES')
  }

  public async fetchPage(id: string | number, request?: Partial<DemetraRequestPage>) : Promise<WpData> {
    const params = new DemetraRequestPage(id, request, this.options.lang, this.options.site, this.options.version);
    return this.fetch(params);
  }

  public async fetchArchive(id: string, request?: Partial<DemetraRequestArchive>): Promise<WpData> {
    const params = new DemetraRequestArchive(id, request, this.options.lang, this.options.site, this.options.version);
    return this.fetch(params);
  }

  public async fetchExtra(id: string, request?: Partial<DemetraRequestExtra>): Promise<WpData> {
    const params = new DemetraRequestExtra(id, request, this.options.lang, this.options.site, this.options.version);
    return this.fetch(params);
  }

  public async fetchMenu(id: string, request?: Partial<DemetraRequestMenu>): Promise<WpData> {
    const params = new DemetraRequestMenu(id, request, this.options.lang, this.options.site, this.options.version);
    return this.fetch(params);
  }

  public async fetchTaxonomy(id: string, request?: Partial<DemetraRequestTaxonomy>): Promise<WpData> {
    const params = new DemetraRequestTaxonomy(id, request, this.options.lang, this.options.site, this.options.version);
    return this.fetch(params);
  }

  public async subscribe(email: string): Promise<WpData> {
    const params = new DemetraRequestSubscribe(email, this.options.version);
    return this.fetch(params);
  }

  public async send(id: number, recipients : string, data : object, files? : Array<File>): Promise<WpData> {
    let urls: Array<string> = [];

    if (files && files.length > 0) {
      const uploadResponses: Array<WpFile> = await this.upload(files);

      uploadResponses.forEach((file) => {
        if (typeof file !== 'object') {
          throw new Error('Invalid response. It mus be an object');
        }
        if (!file.hasOwnProperty('file')) {
          throw new Error('Invalid File Response');
        }
        urls.push(file.data.url);
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
    params : DemetraRequestPage |
             DemetraRequestArchive |
             DemetraRequestExtra |
             DemetraRequestMenu |
             DemetraRequestTaxonomy | 
             DemetraRequestSubscribe |
             DemetraRequestSend
  ) : Promise<WpData> {
    // Controllo local cache
    const requests = new Array();
    requests.push(params);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const request = new Request(this.options.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requests }),
    });
    const response = await fetch(request);
    const json : Array<WpData> = await response.json() as Array<WpData>;
    json.forEach((reponse) => {
      this.debugLog(response);
      this.handleError(response);
    });
    return json[0];
  }

  public async upload(files : Array<File> | File) : Promise<Array<WpFile>> {
    if (typeof this.options.uploadEndpoint === 'undefined') throw new Error('No upload endpoint defined');
    files = Array.isArray(files) ? files : [files];

    const responses : Array<Promise<Response>> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      const request = new Request(this.options.uploadEndpoint, { method: 'POST', body: formData });
      responses.push(fetch(request));
    }
    const promisesResponses = await Promise.all(responses);
    const jsons : Array<Promise<WpFile>> = [];
    for (let i = 0; i < promisesResponses.length; i++) {
      const response = promisesResponses[i];
      jsons.push(response.json());
    }
    return Promise.all(jsons);
  }

  private async sendOnce(): Promise<Array<object>> {
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

  private async sendSimultaneously(): Promise<Array<WpData>> {
    const promises: Array<Promise<WpData>> = this.queue.requests.map(request => this.fetch(request));
    return Promise.all(promises);
  }

  private async sendConsequentially(): Promise<Array<WpData>> {
    const responses : Array<WpData> = [];
    for (const request of this.queue.requests) {
      responses.push(await this.fetch(request));
    }
    return responses;
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
export { DemetraRequest };
