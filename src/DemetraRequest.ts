import md5 from 'md5';

import DEFAULTS from './defaults';
import serialize from './object-to-formdata';
import { isUndefined } from './validators';
import { DemetraRequestOptions, FetchOptions, MODES } from './declarations';

class DemetraRequest {
  public readonly options: DemetraRequestOptions;

  public static addConfig(data: FormData): RequestInit {
    return {
      method: 'POST',
      mode: 'cors',
      body: data,
    };
  }

  constructor(mode : MODES, id: number | string, options?: Partial<FetchOptions>) {
    this.options = { ...DEFAULTS.get(mode), ...options };
    this.options.id = id;
    this.options.mode = mode;

    this.validate();
  }

  private validate(): void {
    if (isUndefined(this.options.mode)) {
      throw new Error('Missing mode');
    }

    if (MODES.hasOwnProperty(this.options.mode)) {
      throw new Error('Invalid mode');
    }

    if (isUndefined(this.options.id)) {
      throw new Error('Missing id');
    }
  }

  public get localCache(): Boolean {
    return this.options.localCache || false;
  }

  public get key(): string {
    return md5(JSON.stringify(this.options));
  }

  public get data(): FormData {
    return serialize([this.options], { indices: true, }, undefined, 'requests');
  }

  public get config(): RequestInit {
    return {
      method: 'POST',
      mode: 'cors',
      body: this.data,
    };
  }
}

export default DemetraRequest;
