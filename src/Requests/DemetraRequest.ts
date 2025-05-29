import { createHash } from "crypto";
import { WP_MODES } from "../declarations";

class DemetraRequest {
  public id: string | number | Array<string> | Array<number> | undefined = undefined;
  public mode: WP_MODES;
  public lang: string;
  public site: string;
  public version: number;

  private md5: string = '';

  constructor(
    mode: WP_MODES,
    id: string | number | Array<string> | Array<number>,
    lang: string = 'en',
    site: string = 'default',
    version: number = 2,
  ) {
    this.id = id;
    this.mode = mode;
    this.lang = lang;
    this.site = site;
    this.version = version;

    if(typeof this.id === 'undefined') throw new Error('Request id cannot be undefined');
  }

  public get hash() {
    if (this.md5.length > 0 ) return this.md5;
    this.md5 = createHash('md5').update(JSON.stringify(this)).digest('hex');
    return this.md5;
  }
}

export default DemetraRequest;
