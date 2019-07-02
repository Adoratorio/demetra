import axios, { AxiosResponse } from 'axios';
import {
  DemetraOptions,
  Filter,
  Pagination,
  Request
} from "./declarations";
import Defaults from './defaults';

class Demetra {
  private static Defaults = Defaults;

  private options : DemetraOptions;
  private endpoint : string = '';
  private request : Request = {
    header: null,
    lang: 'en',
    site: 'default',
    page: null,
    menu: null,
    archive: null,
  };

  constructor(options : Partial<DemetraOptions>) {
    const defaults : DemetraOptions = {
      endpoint: '',
      url: '',
      version: Demetra.Defaults.VERSION,
      project: Demetra.Defaults.SITE,
      site: Demetra.Defaults.SITE,
      lang: Demetra.Defaults.LANG,
      debug: false,
    };
    this.options = { ...options, ...defaults};

    this.endpoint = this.options.endpoint;
  }

  public queuePage(
    slug : string | number,
    type : string | undefined,
    siblings : boolean = false,
    fields : Array<string>,
    prev : boolean = true,
    next : boolean = true,
    loop : boolean = true
  ) {
    if (typeof type === 'undefined') type = 'pages';
    this.request.page = {
      id: slug,
      type,
      siblings: {
        prev: siblings ? prev : false,
        next: siblings ? next : false,
        loop,
        fields,
      }
    }
    return this.request;
  }

  public queueMenu(slug : string | number) {
    this.request.menu = {
      id: slug,
    }
    return this.request;
  }

  public queueArchive(
    type : string,
    fields : Array<string>,
    pagination : Pagination,
    filters : Array<Filter>,
  ) {
    this.request.archive = {
      type,
      fields,
      filters,
      pagination,
    };
    return this.request;
  }

  public async fetch() {
    const response : AxiosResponse = await axios.post(this.endpoint, this.request);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  public async fetchPage(
    slug : string | number,
    type : string | undefined,
    siblings : boolean = false,
    fields : Array<string>,
    prev : boolean = true,
    next : boolean = true,
    loop : boolean = true
  ) {
    if (typeof type === 'undefined') type = 'pages';
    const request : Partial<Request> = {
      page: {
        id: slug,
        type,
        siblings: {
          prev: siblings ? prev : false,
          next: siblings ? next : false,
          loop,
          fields,
        }
      },
      menu: null,
      archive: null,
    };
    this.setHeaders(request);
    const response : AxiosResponse = await axios.post(this.endpoint, request);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }
  
  public async fetchMenu(slug : string | number) {
    const request : Partial<Request> = {
      page: null,
      menu: {
        id: slug,
      },
      archive: null,
    };
    this.setHeaders(request);
    const response : AxiosResponse = await axios.post(this.endpoint, request);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  public async fetchArchive(
    type : string,
    fields : Array<string>,
    pagination : Pagination,
    filters : Array<Filter>
  ) {
    const request : Partial<Request> = {
      page: null,
      menu: null,
      archive: {
        type,
        fields,
        filters,
        pagination,
      }
    }
    this.setHeaders(request);
    const response : AxiosResponse = await axios.post(this.endpoint, request);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  public async rawRequest(request : Request) {
    this.setHeaders(request);
    const response : AxiosResponse = await axios.post(this.endpoint, request);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  private setHeaders(request : Partial<Request>) {
    request.header = {
      url: this.options.url || '',
      version: this.options.version || Demetra.Defaults.VERSION,
      project: this.options.site || Demetra.Defaults.SITE,
    };
    request.lang = this.options.lang;
    request.site = this.options.site;
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