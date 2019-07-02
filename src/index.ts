import axios, { AxiosResponse } from 'axios';
import {
  DemetraOptions,
  Filter,
  Pagination,
  Request
} from "./declarations";

class Demetra {
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

  constructor(options : DemetraOptions) {
    this.options = options;
    if (typeof this.options.debug === 'undefined') {
      this.options.debug = false;
    }
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
    const request : Request = {
      header: {
        url: this.options.url,
        version: this.options.version || 2,
        project: this.options.site || 'default',
      },
      lang: this.options.lang || 'en',
      site: this.options.site || 'default',
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
    const response : AxiosResponse = await axios.post(this.endpoint, request);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }
  
  public async fetchMenu(slug : string | number) {
    const request : Request = {
      header: {
        url: this.options.url,
        version: this.options.version || 2,
        project: this.options.site || 'default',
      },
      lang: this.options.lang || 'en',
      site: this.options.site || 'default',
      page: null,
      menu: {
        id: slug,
      },
      archive: null,
    };
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
    const request : Request = {
      header: {
        url: this.options.url,
        version: this.options.version || 2,
        project: this.options.site || 'default',
      },
      lang: this.options.lang || 'en',
      site: this.options.site || 'default',
      page: null,
      menu: null,
      archive: {
        type,
        fields,
        filters,
        pagination,
      }
    }
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

  private setHeaders(request : Request) {
    request.header = {
      url: this.options.url,
      version: this.options.version || 2,
      project: this.options.site || 'default',
    };
    request.lang = this.options.lang || 'en';
    request.site = this.options.site || 'default';
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