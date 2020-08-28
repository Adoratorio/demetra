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
      cache: true,
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
      i18n,
      cache: this.options.cache,
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
      cache: this.options.cache,
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
      cache: this.options.cache,
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
      cache: this.options.cache,
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

  public async fetchTaxonomy(slug : string) {
    this.request = {
      mode: Demetra.Modes.TAXONOMY,
      lang: this.options.lang,
      version: this.options.version,
      site: this.options.site,
      id: slug,
      cache: this.options.cache,
    };
    const config : AxiosRequestConfig = {
      url: this.options.endpoint,
      method: 'post',
      data: this.request,
    }

    this.validation('taxonomy', this.request);

    const response : AxiosResponse = await axios(config);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  public async send(id : number, data : string) {
    this.request = {
      mode: Demetra.Modes.SEND,
      lang: this.options.lang,
      version: this.options.version,
      site: this.options.site,
      id: id,
      cache: this.options.cache,
      data: data,
    };
    const config : AxiosRequestConfig = {
      url: this.options.endpoint,
      method: 'post',
      data: this.request,
    }

    this.validation('send', this.request);

    const response : AxiosResponse = await axios(config);
    this.debugLog(response);
    this.handleError(response);
    return response.data;
  }

  public async subscribe(email : string) {
    this.request = {
      mode: Demetra.Modes.SEND,
      lang: this.options.lang,
      version: this.options.version,
      site: this.options.site,
      cache: this.options.cache,
      email: email,
    };
    const config : AxiosRequestConfig = {
      url: this.options.endpoint,
      method: 'post',
      data: this.request,
    }

    this.validation('subscribe', this.request);

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

      case (mode === 'page' || mode === 'menu' || mode === 'extra' || mode === 'taxonomy'):
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

      case (mode === 'send'):
        if (
          typeof request.type === 'undefined'
          || typeof request.id === 'undefined'
          || typeof request.data !== 'string'
        ) {
          if (this.options.debug) {
            console.log(request);
          }
          throw new Error('Invalid send payload, missing id or data is not a serialized JSON string');
        }
        break;

      case (mode === 'subscribe'):
        if (typeof request.type === 'undefined' || typeof request.email === 'undefined') {
          if (this.options.debug) {
            console.log(request);
          }
          throw new Error('Invalid send payload, missing id or data is not a serialized JSON string');
        }
        break;
    }
  }

  public get lang() {
    return this.options.lang;
  }

  public set lang(lang : string) {
    this.options.lang = lang;
  }

  public get site() {
    return this.options.site;
  }

  public set site(site : string) {
    this.options.site = site;
  }
}

export default Demetra;