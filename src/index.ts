import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import {
  DemetraOptions,
  Filter,
  Pagination,
  Request,
} from "./declarations";
import Defaults from './defaults';
import Modes from './modes';

class Demetra {
  private static Defaults = Defaults;
  private static Modes = Modes;

  private options : DemetraOptions;
  private endpoint : string = '';
  private request : Request = {
    mode: 'page',
    lang: 'en',
    version: 2,
    project: '',
    site: 'default',
    id: '',
    type: 'pages',
  };

  constructor(options : Partial<DemetraOptions>) {
    if (typeof options.project === 'undefined') {
      throw new Error('Project cannot be undefined');
    }
    const defaults : DemetraOptions = {
      endpoint: '',
      lang: Demetra.Defaults.LANG,
      version: Demetra.Defaults.VERSION,
      project: '',
      site: Demetra.Defaults.SITE,
      debug: false,
    };
    this.options = { ...defaults, ...options};

    this.endpoint = this.options.endpoint;
  }

  public async fetchPage(
    slug : string | number,
    type : string = 'pages',
    siblings : boolean = false,
    fields : Array<string> = [],
    prev : boolean = false,
    next : boolean = false,
    loop : boolean = false
  ) {
    this.request = {
      mode: Demetra.Modes.PAGES,
      lang: this.options.lang,
      version: this.options.version,
      project: this.options.project,
      site: this.options.site,
      id: slug,
      type,
      siblings: {
        prev: siblings ? prev : false,
        next: siblings ? next : false,
        loop,
        fields,
      }
    };
    const config : AxiosRequestConfig = {
      url: this.options.endpoint,
      method: 'post',
      data: this.request,
    }
    const response : AxiosResponse = await axios(config);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }
  
  public async fetchMenu(slug : string | number) {
    this.request = {
      mode: Demetra.Modes.MENU,
      lang: this.options.lang,
      version: this.options.version,
      project: this.options.project,
      site: this.options.site,
      id: slug,
    };
    const config : AxiosRequestConfig = {
      url: this.options.endpoint,
      method: 'post',
      data: this.request,
    }
    const response : AxiosResponse = await axios(config);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  public async fetchArchive(
    type : string,
    fields : Array<string> = [],
    pagination? : Pagination,
    filters : Array<Filter> = [],
  ) {
    this.request = {
      mode: Demetra.Modes.ARCHIVE,
      lang: this.options.lang,
      version: this.options.version,
      project: this.options.project,
      site: this.options.site,
      type,
      fields,
      pagination,
      filters,
    }
    const config : AxiosRequestConfig = {
      url: this.endpoint,
      method: 'post',
      data: this.request,
    }
    const response : AxiosResponse = await axios(config);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }
  
  private handleError(response : AxiosResponse) {
    if (response.status !== 200) {
      if (this.options.debug) {
        console.error(`${response.data.status.code}: ${response.data.status.message}`);
      }
      throw new Error(response.data.status.message);
    }
  }

  private debugLog(response : AxiosResponse) {
    if (this.options.debug) console.log(response);
  }
}

export default Demetra;