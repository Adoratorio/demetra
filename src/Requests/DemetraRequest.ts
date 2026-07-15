import { md5 } from 'js-md5';
import { type WP_MODES } from '../declarations.ts';

class DemetraRequest {
  public id: string | number | string[] | number[] | undefined = undefined;
  public mode: WP_MODES;
  public lang: string;
  public site: string;
  public version: number;

  private md5 = '';

  constructor(
    mode: WP_MODES,
    id: string | number | string[] | number[],
    lang = 'en',
    site = 'default',
    version = 2,
  ) {
    this.id = id;
    this.mode = mode;
    this.lang = lang;
    this.site = site;
    this.version = version;

    if (typeof this.id === 'undefined') {
      throw new Error('Request id cannot be undefined');
    }
  }

  public get hash(): string {
    if (this.md5.length > 0) {
      return this.md5;
    }
    this.md5 = md5.hex(JSON.stringify(this));
    return this.md5;
  }
}

export default DemetraRequest;
