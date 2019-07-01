import {
  DemetraOptions,
} from "./declarations";

class Demetra {
  private options : DemetraOptions;
  private endpoing : string = 'https://';

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

  public fetchPage(slug : string | number, type : string | undefined, prev : Array<string>, next : Array<string>) {

  }
}

export default Demetra;