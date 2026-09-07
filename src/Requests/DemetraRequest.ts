import { type DemetraRequestBaseOptions, type RequestId, type WP_MODES } from '../types.ts';
import { hashString } from '../utils.ts';

export interface DemetraRequestDefaults {
  lang: string;
  site: string;
  version: number;
}

class DemetraRequest {
  public id: RequestId;
  public mode: WP_MODES;
  // Left undefined until sent: the Demetra instance fills in its defaults
  public lang: string | undefined;
  public site: string | undefined;
  public version: number | undefined;

  constructor(mode: WP_MODES, id: RequestId, options: DemetraRequestBaseOptions = {}) {
    if (typeof id === 'undefined' || id === null) {
      throw new Error('[Demetra] Request id cannot be undefined');
    }
    this.id = id;
    this.mode = mode;
    this.lang = options.lang;
    this.site = options.site;
    this.version = options.version;
  }

  // Fill the fields this request does not set explicitly
  public applyDefaults(defaults: DemetraRequestDefaults): this {
    this.lang ??= defaults.lang;
    this.site ??= defaults.site;
    this.version ??= defaults.version;
    return this;
  }

  // Stable key for the local cache, derived from every serialized field
  public get hash(): string {
    return hashString(JSON.stringify(this));
  }
}

export default DemetraRequest;
