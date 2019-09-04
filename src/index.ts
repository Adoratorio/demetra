import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import {
  DemetraOptions,
  Filter,
  Pagination,
  Request,
} from './declarations';
import Defaults from './defaults';
import Modes from './modes';
import {
  validateUrl
} from './validate';

class Demetra {
  private static Defaults = Defaults;
  private static Modes = Modes;

  private options : DemetraOptions;
  private endpoint : string = '';
  private request : Request = {
    mode: 'page',
    lang: 'en',
    version: 2,
    site: 'default',
    id: '',
    i18n: true,
    type: 'page',
  };

  constructor(options : Partial<DemetraOptions>) {
    const defaults : DemetraOptions = {
      endpoint: '',
      lang: Demetra.Defaults.LANG,
      version: Demetra.Defaults.VERSION,
      site: Demetra.Defaults.SITE,
      debug: false,
    };
    this.options = { ...defaults, ...options};


    this.endpoint = this.options.endpoint;
    this.validation('url', this.endpoint);
  }

  public async fetchPage(
    slug : string | number,
    type : string = 'page',
    i18n : boolean = true,
    siblings : boolean = false,
    fields : Array<string> = [],
    prev : boolean = false,
    next : boolean = false,
    loop : boolean = false
  ) {
    this.request = {
      mode: Demetra.Modes.PAGE,
      lang: this.options.lang,
      version: this.options.version,
      site: this.options.site,
      id: slug,
      type,
      i18n: true,
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

    this.validation('page', this.request);

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
      site: this.options.site,
      id: slug,
    };
    const config : AxiosRequestConfig = {
      url: this.options.endpoint,
      method: 'post',
      data: this.request,
    }

    this.validation('menu', this.request);

    const response : AxiosResponse = await axios(config);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  public async fetchArchive(
    type : string,
    fields : Array<string> = [],
    i18n: false,
    pagination? : Pagination,
    filters : Array<Filter> = [],
  ) {
    this.request = {
      mode: Demetra.Modes.ARCHIVE,
      lang: this.options.lang,
      version: this.options.version,
      site: this.options.site,
      type,
      i18n: false,
      fields,
      pagination,
      filters,
    }
    const config : AxiosRequestConfig = {
      url: this.endpoint,
      method: 'post',
      data: this.request,
    }

    this.validation('archive', this.request);

    const response : AxiosResponse = await axios(config);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  public async fetchExtra(slug : string) {
    this.request = {
      mode: Demetra.Modes.EXTRA,
      lang: this.options.lang,
      version: this.options.version,
      site: this.options.site,
      id: slug,
    };
    const config : AxiosRequestConfig = {
      url: this.options.endpoint,
      method: 'post',
      data: this.request,
    }

    this.validation('extra', this.request);

    const response : AxiosResponse = await axios(config);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }
  
  private handleError(response : AxiosResponse) {
    if (response.data.status.code !== 200) {
      if (this.options.debug) {
        console.error(`${response.data.status.code} - ${response.data.status.message}`);
      }
      throw new Error(`${response.data.status.code} - ${response.data.status.message}`);
    }
  }

  private debugLog(response : AxiosResponse) {
    if (this.options.debug) console.log(response);
  }

  private validation(mode : string, request : any) {
    switch (true) {
      case (mode === 'url'):
        if (!validateUrl(request)) {
          if (this.options.debug) {
            console.log(request);
          }
          throw new Error('Invalid endpoint');
        }
        break;

      case (mode === 'page' || mode === 'menu' || mode === 'extra'):
        if (typeof request.id === 'undefined') {
          if (this.options.debug) {
            console.log(request);
          }
          throw new Error('Missing slug/id');
        }
        break;

      case (mode === 'archive'):
        if (typeof request.type === 'undefined') {
          if (this.options.debug) {
            console.log(request);
          }
          throw new Error('Missing type');
        }
        break;
    }
  }
}

export default Demetra;