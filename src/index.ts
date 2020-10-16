import { DemetraOptions, DemetraRequestOptions } from './declarations';
import { serialize } from 'object-to-formdata';
import { validateUrl } from './validators';

import DemetraRequest from './DemetraRequest';
import MODES from './modes';

// TODO: localCache

class Demetra {
  private readonly options : DemetraOptions;
  private readonly requestQueue : Array<DemetraRequest>;
  private static readonly MODES = MODES;

  public defaults : DemetraOptions = {
    endpoint: undefined,
    uploadEndpoint: undefined,
    site: 'default',
    lang: 'en',
    debug: false,
  };

  constructor(options? : Partial<DemetraOptions>) {
    this.options = {...this.defaults, ...options};
    this.requestQueue = [];

    this.validate();
  }

  public async addQueue(requestOptions : DemetraRequest) {
    this.requestQueue.push(requestOptions)
  }

  public async fetch(fetchModes : string) {
    const optionsQueue : Array<DemetraRequestOptions> = this.requestQueue.map(request => request.options);
    const formData : FormData = serialize(optionsQueue);
    const requestInit = DemetraRequest.addConfig(formData);

    const response : Response = await fetch(this.endpoint as RequestInfo, requestInit);
    this.debugLog(response);
    this.handleError(response)

    return response.json();
  }

  public async fetchPage(id : string | number, options? : Partial<DemetraRequestOptions>) {
    if (typeof options !== 'undefined' && typeof options.lang === 'undefined') options.lang = this.defaults.lang;
    return await this.send(Demetra.MODES.PAGE, id, options)
  }

  public async fetchMenu(id: string, options: object) {
    await this.send(Demetra.MODES.MENU, id, options)
  }

  public async fetchArchive(id : string, options : object) {
    return await this.send(Demetra.MODES.ARCHIVE, id, options)
  }

  public async fetchExtra(id : string, options : object) {
    return await this.send(Demetra.MODES.EXTRA, id, options)
  }

  public async fetchTaxonomy(id : | number, options : object) {
    return await this.send(Demetra.MODES.TAXONOMY, id, options)
  }

  // recipients : string, data : string, attachments : Array<File>
  // public async send(id: number, options: object) {
  // }

  // public async subscribe(email: string) {
  // }

  // public async upload(files: File | Array<File>) {
  // }

  // private handleError(response: AxiosResponse) {
  // }

  // private debugLog(response: AxiosResponse) {
  // }

  // private validation(mode: string, request: any) {
  // }

  private validate() : void {
    if (typeof this.options.endpoint === 'undefined') {
      throw new Error('Endpoint cannot be undefined')
    }

    if (!validateUrl(this.options.endpoint)) {
      throw new Error('Invalid endpoint');
    }

    if (typeof this.options.uploadEndpoint === 'undefined') {
      this.options.uploadEndpoint = this.options.endpoint.replace('/api.php', '/upload.php');
    }
  }

  private async send(mode: string, id : number | string, options? : Partial<DemetraRequestOptions>) : Promise<object> {
    const request = new DemetraRequest(mode, id, options);

    const response : Response = await fetch(this.endpoint as RequestInfo, request.config);
    this.debugLog(response);
    this.handleError(response)

    return response.json();
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

  public get endpoint() : string | undefined {
    return this.options.endpoint;
  }

  public set endpoint(url : string | undefined) {
    this.options.endpoint = url;
  }
}
