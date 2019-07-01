import axios from 'axios';
import {
  DemetraOptions,
  Filter,
  Pagination
} from "./declarations";

class Demetra {
  private options : DemetraOptions;
  private endpoint : string = 'https://';

  constructor(options : DemetraOptions) {
    this.options = options;
    if (typeof this.options.version === 'undefined') {
      this.options.version = 2;
    }
    if (typeof this.options.site === 'undefined') {
      this.options.site = 'default';
    }
    if (typeof this.options.lang === 'undefined') {
      this.options.lang = 'en';
    }
    if (typeof this.options.debug === 'undefined') {
      this.options.debug = false;
    }
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
    const request : any = {
      header: {
        url: this.options.url,
        version: this.options.version,
        project: this.options.site,
      },
      lang: this.options.lang,
      site: this.options.site,
      page: {
        id: slug,
        type: type,
        siblings: {
          prev: siblings ? prev : false,
          next: siblings ? next : false,
          loop,
          fields,
        }
      }
    };
    const response = await axios.post(this.endpoint, request);
    this.handleError(response);
    return response;
  }
  
  public async fetchMenu(slug : string | number) {
    const request : any = {
      header: {
        url: this.options.url,
        version: this.options.version,
        project: this.options.site,
      },
      lang: this.options.lang,
      site: this.options.site,
      menu: {
        id: slug,
      }
    };
    const response = await axios.post(this.endpoint, request);
    this.handleError(response);
    return response;
  }

  public async fetchArchive(
    type : string,
    fields : Array<string>,
    pagination : Pagination,
    filters : Array<Filter>
  ) {
    const request : any = {
      header: {
        url: this.options.url,
        version: this.options.version,
        project: this.options.site,
      },
      lang: this.options.lang,
      site: this.options.site,
      archive: {
        type,
        fields,
        filters,
        pagination,
      }
    }
    const response = await axios.post(this.endpoint, request);
    this.handleError(response);
    return response;
  }

  public async rawRequest(request : any) {
    request.header = {
      url: this.options.url,
      version: this.options.version,
      project: this.options.site,
    }
    request.lang = this.options.lang;
    request.site = this.options.site;
    const response = await axios.post(this.endpoint, request);
    this.handleError(response);
    return response;
  }
  
  public handleError(response : any) {
    if (response.status !== 200) {
      if (this.options.debug) {
        console.error(`${response.data.status.code}: ${response.data.status.message}`);
      }
      throw new Error(response.data.status.message);
    }
  }
}

export default Demetra;