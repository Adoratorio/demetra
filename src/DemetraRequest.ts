import md5 from 'md5';

import { DemetraRequestOptions, FetchOptions } from './declarations';
import { FETCH_OPTIONS, WP_MODES } from './defaults';

class DemetraRequest {
  public readonly options: DemetraRequestOptions;

  public static addConfig(data: string): RequestInit {
    return {
      method: 'POST',
      mode: 'cors',
      body: data,
    };
  }

  constructor(mode : WP_MODES, id: number | string, options?: Partial<FetchOptions>) {
    this.options = { ...FETCH_OPTIONS.get(mode), ...options, id, mode };

    if (typeof this.options.mode === 'undefined') {
      throw new Error('Missing mode');
    }

    if (typeof this.options.id === 'undefined') {
      throw new Error('Missing id');
    }
  }

  public get localCache(): boolean {
    return this.options.localCache || false;
  }

  public get hash() : string {
    return md5(JSON.stringify(this.options));
  }

  public get data() : string {
    if (Array.isArray(this.options)) {
      return JSON.stringify([this.options]);
    }

    return JSON.stringify(this.options);
  }

  public get config(): RequestInit {
    return DemetraRequest.addConfig(this.data);
  }
}

export default DemetraRequest;
